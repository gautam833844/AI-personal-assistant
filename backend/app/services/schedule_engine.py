"""
Core Schedule Reasoning Engine

Deterministic Python schedule calculation and reasoning module.
Provides time parsing, slot classification, time filtering, free-time gap calculation,
weekend aggregation, and next-event lookahead.

Completely independent of LLM prompts, frontend regex, or network/DB services.
"""

from datetime import datetime, timedelta
import re
from typing import Any, Dict, List, Optional, Tuple

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Standard active/operating window for free-time calculations (09:00 AM – 05:00 PM)
ACTIVE_DAY_START_MINUTES = 9 * 60     # 540 minutes (09:00 AM)
ACTIVE_DAY_END_MINUTES = 17 * 60      # 1020 minutes (05:00 PM)

# Standard time-of-day classification boundaries
TIME_OF_DAY_BOUNDS: Dict[str, Tuple[int, int]] = {
    "morning": (8 * 60, 12 * 60),      # 08:00 AM – 12:00 PM (480 to 720 mins)
    "afternoon": (12 * 60, 17 * 60),   # 12:00 PM – 05:00 PM (720 to 1020 mins)
    "evening": (17 * 60, 21 * 60),     # 05:00 PM – 09:00 PM (1020 to 1260 mins)
}

DEFAULT_EVENT_DURATION_MINUTES = 60


# -----------------------------------------------------------------------------
# 1. TIME PARSING AND FORMATTING HELPERS
# -----------------------------------------------------------------------------

def parse_time_to_minutes(time_str: Optional[str]) -> Optional[int]:
    """
    Parses a time string into minutes since midnight (0..1439).
    Supports:
      - 12-hour: '09:00 AM', '9:00 AM', '9 AM', '12:00 PM', '12:00 AM', '2:30 pm'
      - 24-hour: '09:00', '14:30', '17:00:00'
    Correctly handles 12 AM (0 min) and 12 PM (720 min).
    """
    if not time_str or not isinstance(time_str, str):
        return None

    raw = time_str.strip().upper()

    # 12-hour format: e.g. 09:00 AM, 9:30 PM, 9 AM, 12:00 PM, 12 AM
    match_12 = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$", raw)
    if match_12:
        hour = int(match_12.group(1))
        minute = int(match_12.group(2) or 0)
        ampm = match_12.group(3)
        if hour < 1 or hour > 12 or minute < 0 or minute > 59:
            return None
        if ampm == "AM":
            hour_24 = 0 if hour == 12 else hour
        else:
            hour_24 = 12 if hour == 12 else hour + 12
        return hour_24 * 60 + minute

    # 24-hour format: e.g. 09:00, 14:30, 23:59
    match_24 = re.match(r"^(\d{1,2}):(\d{2})(?::\d{2})?$", raw)
    if match_24:
        hour = int(match_24.group(1))
        minute = int(match_24.group(2))
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return hour * 60 + minute

    return None


def minutes_to_time_str(mins: int) -> str:
    """
    Converts minutes since midnight (0..1439) to a standard 12-hour time string,
    e.g. 540 -> '09:00 AM', 720 -> '12:00 PM', 840 -> '02:00 PM'.
    """
    mins = max(0, min(1439, mins))
    h24 = (mins // 60) % 24
    m = mins % 60
    ampm = "AM" if h24 < 12 else "PM"
    h12 = h24 % 12
    if h12 == 0:
        h12 = 12
    return f"{h12:02d}:{m:02d} {ampm}"


def format_minutes_duration(minutes: int) -> str:
    """
    Formats a duration in minutes into a human-readable string,
    e.g. 60 -> '1 hr', 120 -> '2 hrs', 90 -> '1 hr 30 mins', 45 -> '45 mins'.
    """
    if minutes <= 0:
        return "0 mins"
    h = minutes // 60
    m = minutes % 60
    if h > 0 and m > 0:
        return f"{h} hr{'s' if h > 1 else ''} {m} mins"
    elif h > 0:
        return f"{h} hr{'s' if h > 1 else ''}"
    else:
        return f"{m} mins"


# -----------------------------------------------------------------------------
# 2. EVENT NORMALIZATION AND EXTRACTION
# -----------------------------------------------------------------------------

def normalize_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a schedule event dictionary with explicit start, end, and duration times.
    If endTime or durationMinutes are missing, defaults duration to 60 minutes.
    """
    title = event.get("title", "Event")
    loc = event.get("location", "")
    etype = event.get("type", "class")
    start_str = event.get("time", "")
    end_str = event.get("endTime")
    duration = event.get("durationMinutes")

    start_min = parse_time_to_minutes(start_str)
    end_min = parse_time_to_minutes(end_str)

    if start_min is not None:
        if end_min is not None:
            duration_min = max(0, end_min - start_min)
        elif duration is not None:
            duration_min = int(duration)
            end_min = start_min + duration_min
        else:
            duration_min = DEFAULT_EVENT_DURATION_MINUTES
            end_min = start_min + duration_min
        canonical_start = minutes_to_time_str(start_min)
        canonical_end = minutes_to_time_str(end_min)
    else:
        start_min = 0
        end_min = 0
        duration_min = 0
        canonical_start = start_str
        canonical_end = end_str or ""

    days_list = event.get("days") or ([event.get("day")] if event.get("day") else [])

    return {
        "id": str(event.get("id", "")),
        "title": title,
        "location": loc,
        "type": etype,
        "time": canonical_start,
        "endTime": canonical_end,
        "startMinutes": start_min,
        "endMinutes": end_min,
        "durationMinutes": duration_min,
        "day": event.get("day"),
        "days": days_list,
        "label": f"{title} ({etype}) at {canonical_start} – {canonical_end}" + (f" in {loc}" if loc else ""),
    }


def normalize_day(day_str: Optional[str], now: Optional[datetime] = None) -> Tuple[str, bool]:
    """
    Normalizes a day query string.
    Returns a tuple of: (canonical_day_name_or_keyword, is_weekend_query)
    e.g. 'today' -> ('Tuesday', False), 'tomorrow' -> ('Wednesday', False), 'weekend' -> ('weekend', True)
    """
    if now is None:
        now = datetime.now()

    raw = (day_str or "today").strip().lower()

    if raw in ("weekend", "weekends", "this weekend") or "weekend" in raw:
        return ("weekend", True)

    if raw == "today":
        day_name = now.strftime("%A")
        return (day_name, False)

    if raw == "tomorrow":
        day_name = (now + timedelta(days=1)).strftime("%A")
        return (day_name, False)

    days_map = {d.lower(): d for d in DAYS_OF_WEEK}
    for k, v in days_map.items():
        if k in raw:
            return (v, False)

    # Fallback to current weekday
    current_day = now.strftime("%A")
    return (current_day, False)


def get_events_for_day(schedule: List[Dict[str, Any]], target_day: str) -> List[Dict[str, Any]]:
    """
    Retrieves and normalizes all events matching target_day, sorted chronologically by start time.
    """
    matched = []
    target_lower = target_day.strip().lower()

    for raw_ev in schedule or []:
        ev_days = [str(d).strip().lower() for d in (raw_ev.get("days") or ([raw_ev.get("day")] if raw_ev.get("day") else []))]
        if target_lower in ev_days:
            matched.append(normalize_event(raw_ev))

    matched.sort(key=lambda x: (x["startMinutes"], x["endMinutes"]))
    return matched


# -----------------------------------------------------------------------------
# 3. TIME-OF-DAY AND CUTOFF FILTERING
# -----------------------------------------------------------------------------

def filter_events(
    events: List[Dict[str, Any]],
    time_of_day: Optional[str] = None,
    after_time: Optional[str] = None,
    before_time: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Filters events by:
      - time_of_day: 'morning' (08:00 AM–12:00 PM), 'afternoon' (12:00 PM–05:00 PM), 'evening' (05:00 PM–09:00 PM)
      - after_time: e.g. '02:00 PM' (events starting at or after, or active after this time)
      - before_time: e.g. '12:00 PM' (events starting before this time)
    """
    filtered = list(events)

    if time_of_day:
        tod_key = time_of_day.strip().lower()
        if tod_key in TIME_OF_DAY_BOUNDS:
            tod_start, tod_end = TIME_OF_DAY_BOUNDS[tod_key]
            # An event occurs in the time-of-day window if their time intervals overlap
            filtered = [
                ev for ev in filtered
                if max(ev["startMinutes"], tod_start) < min(ev["endMinutes"], tod_end)
            ]

    if after_time:
        after_min = parse_time_to_minutes(after_time)
        if after_min is not None:
            # Matches events starting at or after after_time, or ending after after_time
            filtered = [
                ev for ev in filtered
                if ev["startMinutes"] >= after_min or ev["endMinutes"] > after_min
            ]

    if before_time:
        before_min = parse_time_to_minutes(before_time)
        if before_min is not None:
            # Matches events starting before before_time
            filtered = [
                ev for ev in filtered
                if ev["startMinutes"] < before_min
            ]

    filtered.sort(key=lambda x: (x["startMinutes"], x["endMinutes"]))
    return filtered


# -----------------------------------------------------------------------------
# 4. FREE TIME AND GAP CALCULATION
# -----------------------------------------------------------------------------

def calculate_free_windows(
    events: List[Dict[str, Any]],
    window_start_min: int = ACTIVE_DAY_START_MINUTES,
    window_end_min: int = ACTIVE_DAY_END_MINUTES
) -> List[Dict[str, Any]]:
    """
    Calculates free time gaps within an active operating window (default 09:00 AM – 05:00 PM).
    Merges overlapping or touching busy intervals before calculating gaps.
    """
    if window_start_min >= window_end_min:
        return []

    # Clamp events to the window
    busy_intervals: List[Tuple[int, int]] = []
    for ev in events:
        s = max(window_start_min, ev["startMinutes"])
        e = min(window_end_min, ev["endMinutes"])
        if s < e:
            busy_intervals.append((s, e))

    # If completely free
    if not busy_intervals:
        dur = window_end_min - window_start_min
        s_str = minutes_to_time_str(window_start_min)
        e_str = minutes_to_time_str(window_end_min)
        return [{
            "start": s_str,
            "end": e_str,
            "startMinutes": window_start_min,
            "endMinutes": window_end_min,
            "durationMinutes": dur,
            "label": f"{s_str} – {e_str} ({format_minutes_duration(dur)})",
        }]

    # Merge overlapping or touching busy intervals
    busy_intervals.sort(key=lambda x: x[0])
    merged: List[Tuple[int, int]] = []
    curr_s, curr_e = busy_intervals[0]
    for s, e in busy_intervals[1:]:
        if s <= curr_e:
            curr_e = max(curr_e, e)
        else:
            merged.append((curr_s, curr_e))
            curr_s, curr_e = s, e
    merged.append((curr_s, curr_e))

    # Identify open gaps
    free_windows: List[Dict[str, Any]] = []
    cursor = window_start_min

    for s, e in merged:
        if cursor < s:
            gap_dur = s - cursor
            s_str = minutes_to_time_str(cursor)
            e_str = minutes_to_time_str(s)
            free_windows.append({
                "start": s_str,
                "end": e_str,
                "startMinutes": cursor,
                "endMinutes": s,
                "durationMinutes": gap_dur,
                "label": f"{s_str} – {e_str} ({format_minutes_duration(gap_dur)})",
            })
        cursor = max(cursor, e)

    if cursor < window_end_min:
        gap_dur = window_end_min - cursor
        s_str = minutes_to_time_str(cursor)
        e_str = minutes_to_time_str(window_end_min)
        free_windows.append({
            "start": s_str,
            "end": e_str,
            "startMinutes": cursor,
            "endMinutes": window_end_min,
            "durationMinutes": gap_dur,
            "label": f"{s_str} – {e_str} ({format_minutes_duration(gap_dur)})",
        })

    return free_windows


# -----------------------------------------------------------------------------
# 5. NEXT-EVENT LOOKAHEAD
# -----------------------------------------------------------------------------

def find_next_event(
    schedule: List[Dict[str, Any]],
    now: Optional[datetime] = None
) -> Optional[Dict[str, Any]]:
    """
    Finds the earliest upcoming event:
      1. Checks remaining events today (start time >= current time, or in-progress).
      2. If none remain today, checks tomorrow, then subsequent days up to 7 days ahead.
    Returns a structured dictionary with event info, day, and time delta.
    """
    if now is None:
        now = datetime.now()

    current_minutes = now.hour * 60 + now.minute
    today_name = now.strftime("%A")
    today_events = get_events_for_day(schedule, today_name)

    # 1. Check upcoming events today
    for ev in today_events:
        if ev["startMinutes"] >= current_minutes:
            diff_mins = ev["startMinutes"] - current_minutes
            return {
                **ev,
                "scheduledDay": today_name,
                "isToday": True,
                "isTomorrow": False,
                "daysAhead": 0,
                "minutesUntilStart": diff_mins,
                "status": "upcoming_today",
            }
        elif ev["endMinutes"] > current_minutes:
            # Event is in-progress right now
            return {
                **ev,
                "scheduledDay": today_name,
                "isToday": True,
                "isTomorrow": False,
                "daysAhead": 0,
                "minutesRemaining": ev["endMinutes"] - current_minutes,
                "status": "in_progress",
            }

    # 2. Lookahead to subsequent days (1 through 7)
    for offset in range(1, 8):
        target_date = now + timedelta(days=offset)
        target_day_name = target_date.strftime("%A")
        events_on_day = get_events_for_day(schedule, target_day_name)
        if events_on_day:
            first_ev = events_on_day[0]
            is_tomorrow = (offset == 1)
            return {
                **first_ev,
                "scheduledDay": target_day_name,
                "scheduledDate": target_date.strftime("%b %d"),
                "isToday": False,
                "isTomorrow": is_tomorrow,
                "daysAhead": offset,
                "status": "upcoming_future",
            }

    return None


# -----------------------------------------------------------------------------
# 6. BUSY SUMMARY AND SCHEDULE DENSITY
# -----------------------------------------------------------------------------

def calculate_busy_summary(
    events: List[Dict[str, Any]],
    free_windows: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes deterministic schedule density metrics.
    """
    event_count = len(events)
    total_scheduled_minutes = sum(ev["durationMinutes"] for ev in events)
    total_scheduled_hours = round(total_scheduled_minutes / 60.0, 1)

    total_free_minutes = sum(w["durationMinutes"] for w in free_windows)
    total_free_hours = round(total_free_minutes / 60.0, 1)

    longest_free_gap = max((w["durationMinutes"] for w in free_windows), default=0)

    # Check back-to-back classes
    has_back_to_back = False
    for i in range(len(events) - 1):
        if events[i]["endMinutes"] == events[i + 1]["startMinutes"]:
            has_back_to_back = True
            break

    # An intuitive definition of 'packed': 3 or more events, or 3+ hours scheduled
    is_packed = (event_count >= 3) or (total_scheduled_minutes >= 180)

    return {
        "eventCount": event_count,
        "totalScheduledMinutes": total_scheduled_minutes,
        "totalScheduledHours": total_scheduled_hours,
        "totalFreeMinutes": total_free_minutes,
        "totalFreeHours": total_free_hours,
        "longestFreeGapMinutes": longest_free_gap,
        "hasBackToBack": has_back_to_back,
        "isPacked": is_packed,
    }


# -----------------------------------------------------------------------------
# 7. MAIN PUBLIC RESOLVER
# -----------------------------------------------------------------------------

def resolve_schedule(
    schedule: List[Dict[str, Any]],
    day: Optional[str] = "today",
    time_of_day: Optional[str] = None,
    after_time: Optional[str] = None,
    before_time: Optional[str] = None,
    query_type: str = "events",
    now: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Primary entry point for deterministic schedule analysis.

    Parameters:
      - schedule: List of schedule event dicts from user context
      - day: 'today', 'tomorrow', 'Monday'..'Sunday', 'weekend'
      - time_of_day: 'morning', 'afternoon', 'evening'
      - after_time: e.g. '02:00 PM'
      - before_time: e.g. '12:00 PM'
      - query_type: 'events', 'free_time', 'next_event', 'busy_summary', 'availability'
      - now: optional reference datetime for deterministic testing

    Returns a rich, structured dictionary of deterministic schedule calculations.
    """
    if now is None:
        now = datetime.now()

    target_day, is_weekend = normalize_day(day, now=now)

    query_metadata = {
        "dayRequested": day,
        "resolvedDay": target_day,
        "isWeekend": is_weekend,
        "timeOfDay": time_of_day,
        "afterTime": after_time,
        "beforeTime": before_time,
        "queryType": query_type,
        "referenceTime": now.strftime("%I:%M %p"),
        "referenceDate": now.strftime("%A, %b %d, %Y"),
    }

    # -------------------------------------------------------------------------
    # Scenario A: Weekend Aggregation (Saturday + Sunday)
    # -------------------------------------------------------------------------
    if is_weekend or target_day == "weekend":
        sat_events = get_events_for_day(schedule, "Saturday")
        sun_events = get_events_for_day(schedule, "Sunday")
        combined_events = sat_events + sun_events

        # Apply time filters if requested
        filtered_sat = filter_events(sat_events, time_of_day, after_time, before_time)
        filtered_sun = filter_events(sun_events, time_of_day, after_time, before_time)
        filtered_combined = filtered_sat + filtered_sun

        sat_free = calculate_free_windows(filtered_sat)
        sun_free = calculate_free_windows(filtered_sun)

        sat_summary = calculate_busy_summary(filtered_sat, sat_free)
        sun_summary = calculate_busy_summary(filtered_sun, sun_free)

        total_weekend_events = len(filtered_combined)
        is_free_weekend = (total_weekend_events == 0)

        # Build natural summary text
        if is_free_weekend:
            summary_text = "You have no classes or college events scheduled for the weekend (Saturday and Sunday)."
        else:
            parts = []
            if filtered_sat:
                parts.append("Saturday: " + "; ".join(e["label"] for e in filtered_sat))
            else:
                parts.append("Saturday: No events")
            if filtered_sun:
                parts.append("Sunday: " + "; ".join(e["label"] for e in filtered_sun))
            else:
                parts.append("Sunday: No events")
            summary_text = "Weekend Schedule: " + " | ".join(parts)

        return {
            "targetDay": "weekend",
            "isWeekend": True,
            "queryMetadata": query_metadata,
            "events": filtered_combined,
            "totalEvents": total_weekend_events,
            "isCompletelyFree": is_free_weekend,
            "weekendBreakdown": {
                "saturday": {
                    "events": filtered_sat,
                    "freeWindows": sat_free,
                    "summary": sat_summary,
                },
                "sunday": {
                    "events": filtered_sun,
                    "freeWindows": sun_free,
                    "summary": sun_summary,
                }
            },
            "summaryText": summary_text,
            "nextEvent": find_next_event(schedule, now=now),
        }

    # -------------------------------------------------------------------------
    # Scenario B: Single Day Resolution
    # -------------------------------------------------------------------------
    all_day_events = get_events_for_day(schedule, target_day)
    filtered_events = filter_events(all_day_events, time_of_day, after_time, before_time)

    # Determine free windows in standard active hours (or within time_of_day slot if specified)
    if time_of_day and time_of_day.strip().lower() in TIME_OF_DAY_BOUNDS:
        slot_s, slot_e = TIME_OF_DAY_BOUNDS[time_of_day.strip().lower()]
        free_windows = calculate_free_windows(filtered_events, window_start_min=slot_s, window_end_min=slot_e)
    else:
        free_windows = calculate_free_windows(filtered_events, window_start_min=ACTIVE_DAY_START_MINUTES, window_end_min=ACTIVE_DAY_END_MINUTES)

    busy_metrics = calculate_busy_summary(filtered_events, free_windows)
    is_completely_free = (len(filtered_events) == 0)

    # Calculate next event
    next_event = find_next_event(schedule, now=now)

    # Construct clean, deterministic summary_text
    summary_parts = []
    if is_completely_free:
        scope = f" {time_of_day}" if time_of_day else ""
        if after_time:
            scope += f" after {after_time}"
        if before_time:
            scope += f" before {before_time}"
        summary_text = f"You are completely free on {target_day}{scope}. No classes or events scheduled."
    else:
        event_descriptions = [e["label"] for e in filtered_events]
        summary_text = f"Schedule for {target_day}: " + "; ".join(event_descriptions) + "."
        if free_windows and any(w["durationMinutes"] >= 60 for w in free_windows):
            notable_gaps = [w["label"] for w in free_windows if w["durationMinutes"] >= 60]
            summary_text += f" Free windows: {'; '.join(notable_gaps)}."

    return {
        "targetDay": target_day,
        "isWeekend": False,
        "queryMetadata": query_metadata,
        "events": filtered_events,
        "rawEventsForDay": all_day_events,
        "freeWindows": free_windows,
        "totalEvents": len(filtered_events),
        "totalScheduledMinutes": busy_metrics["totalScheduledMinutes"],
        "totalScheduledHours": busy_metrics["totalScheduledHours"],
        "totalFreeMinutes": busy_metrics["totalFreeMinutes"],
        "totalFreeHours": busy_metrics["totalFreeHours"],
        "longestFreeGapMinutes": busy_metrics["longestFreeGapMinutes"],
        "hasBackToBack": busy_metrics["hasBackToBack"],
        "isPacked": busy_metrics["isPacked"],
        "isCompletelyFree": is_completely_free,
        "nextEvent": next_event,
        "summaryText": summary_text,
    }
