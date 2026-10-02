import { ScheduleEvent } from '../types/schedule';
import { SAMPLE_EVENTS } from '../data/sampleSchedule';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export interface NormalizedScheduleEvent extends ScheduleEvent {
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
}

export interface NextEventInfo {
  event: ScheduleEvent;
  title: string;
  time: string;
  location: string;
  dayLabel: string;
  badgeText: string;
  isToday: boolean;
  isTomorrow: boolean;
  isInProgress: boolean;
  displayTime: string;
  minutesUntilStart?: number;
}

export interface FreeTimeInfo {
  timeRange: string;
  subText: string;
  isAllDay: boolean;
  durationMinutes?: number;
}

export interface UpcomingQuizInfo {
  event: ScheduleEvent;
  title: string;
  timeInfo: string;
  location: string;
  dayLabel: string;
  type: string;
}

// Active college hours window (09:00 AM – 05:00 PM)
const ACTIVE_DAY_START_MINUTES = 9 * 60; // 540
const ACTIVE_DAY_END_MINUTES = 17 * 60;  // 1020

export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const raw = timeStr.trim().toUpperCase();

  // 12-hour format: e.g. 09:00 AM, 9:00 AM, 9 AM, 12:00 PM, 12 AM
  const match12 = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (match12) {
    const hour = parseInt(match12[1], 10);
    const minute = parseInt(match12[2] || '0', 10);
    const ampm = match12[3];
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    let hour24 = hour;
    if (ampm === 'AM') {
      hour24 = hour === 12 ? 0 : hour;
    } else {
      hour24 = hour === 12 ? 12 : hour + 12;
    }
    return hour24 * 60 + minute;
  }

  // 24-hour format: e.g. 09:00, 14:30
  const match24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hour = parseInt(match24[1], 10);
    const minute = parseInt(match24[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return hour * 60 + minute;
    }
  }

  return null;
}

export function minutesToTimeStr(mins: number): string {
  const clamped = Math.max(0, Math.min(1439, mins));
  const h24 = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function formatMinutesDuration(minutes: number): string {
  if (minutes <= 0) return '0 mins';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) {
    return `${h} hr${h > 1 ? 's' : ''} ${m} mins`;
  } else if (h > 0) {
    return `${h} hr${h > 1 ? 's' : ''}`;
  } else {
    return `${m} mins`;
  }
}

export function normalizeEvent(event: ScheduleEvent): NormalizedScheduleEvent {
  const startMinutes = parseTimeToMinutes(event.time) ?? 0;
  let endMinutes = parseTimeToMinutes(event.endTime);
  let durationMinutes = event.durationMinutes;

  if (endMinutes !== null) {
    durationMinutes = Math.max(0, endMinutes - startMinutes);
  } else if (durationMinutes !== undefined) {
    endMinutes = startMinutes + durationMinutes;
  } else {
    durationMinutes = 60;
    endMinutes = startMinutes + 60;
  }

  return {
    ...event,
    startMinutes,
    endMinutes,
    durationMinutes,
  };
}

export function eventOccursOnDay(event: ScheduleEvent, dayName: string): boolean {
  const targetLower = dayName.toLowerCase().trim();
  const daysList = event.days || (event.day ? [event.day] : []);
  return daysList.some((d) => d.toLowerCase().trim() === targetLower);
}

export function getEventsForDay(
  dayName: string,
  events: ScheduleEvent[] = SAMPLE_EVENTS
): NormalizedScheduleEvent[] {
  return events
    .filter((e) => eventOccursOnDay(e, dayName))
    .map(normalizeEvent)
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

/**
 * Returns the immediate next upcoming event (or current in-progress event) from the schedule.
 * If all events today have passed or today is a weekend, looks ahead up to 7 days.
 */
export function getNextUpcomingEvent(
  events: ScheduleEvent[] = SAMPLE_EVENTS,
  now: Date = new Date()
): NextEventInfo | null {
  if (!events || events.length === 0) return null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayName = DAYS_OF_WEEK[now.getDay()];
  const todayEvents = getEventsForDay(todayName, events);

  // 1. Check if any event is currently in progress
  for (const ev of todayEvents) {
    if (ev.startMinutes <= currentMinutes && currentMinutes < ev.endMinutes) {
      return {
        event: ev,
        title: ev.title,
        time: ev.time,
        location: ev.location,
        dayLabel: 'Today',
        badgeText: 'NOW',
        isToday: true,
        isTomorrow: false,
        isInProgress: true,
        displayTime: `Now • Ends ${ev.endTime || minutesToTimeStr(ev.endMinutes)}`,
      };
    }
  }

  // 2. Check upcoming events today
  for (const ev of todayEvents) {
    if (ev.startMinutes > currentMinutes) {
      const minutesUntil = ev.startMinutes - currentMinutes;
      return {
        event: ev,
        title: ev.title,
        time: ev.time,
        location: ev.location,
        dayLabel: 'Today',
        badgeText: 'NEXT',
        isToday: true,
        isTomorrow: false,
        isInProgress: false,
        displayTime: ev.time,
        minutesUntilStart: minutesUntil,
      };
    }
  }

  // 3. No remaining events today -> look ahead across the next 7 days
  for (let offset = 1; offset <= 7; offset++) {
    const targetDate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const targetDayName = DAYS_OF_WEEK[targetDate.getDay()];
    const futureEvents = getEventsForDay(targetDayName, events);

    if (futureEvents.length > 0) {
      const nextEv = futureEvents[0];
      const isTomorrow = offset === 1;
      const dayLabel = isTomorrow ? 'Tomorrow' : targetDayName;
      const badgeText = isTomorrow ? 'TOMORROW' : targetDayName.toUpperCase();
      const displayTime = `${dayLabel} • ${nextEv.time}`;

      return {
        event: nextEv,
        title: nextEv.title,
        time: nextEv.time,
        location: nextEv.location,
        dayLabel,
        badgeText,
        isToday: false,
        isTomorrow,
        isInProgress: false,
        displayTime,
      };
    }
  }

  return null;
}

/**
 * Calculates current or next free time window for today within active college hours (09:00 AM – 05:00 PM).
 */
export function getTodayFreeTimeWindow(
  events: ScheduleEvent[] = SAMPLE_EVENTS,
  now: Date = new Date()
): FreeTimeInfo | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayName = DAYS_OF_WEEK[now.getDay()];
  const isWeekend = todayName === 'Saturday' || todayName === 'Sunday';

  if (isWeekend) {
    return {
      timeRange: 'Free all day',
      subText: 'Weekend • No classes scheduled',
      isAllDay: true,
    };
  }

  const todayEvents = getEventsForDay(todayName, events);

  if (todayEvents.length === 0) {
    return {
      timeRange: 'Free all day',
      subText: 'No classes scheduled today',
      isAllDay: true,
    };
  }

  // Check if all classes for today have ended
  const lastEvent = todayEvents[todayEvents.length - 1];
  if (currentMinutes >= lastEvent.endMinutes) {
    return {
      timeRange: 'Evening is free',
      subText: 'All classes completed for today',
      isAllDay: false,
    };
  }

  // Clamp busy intervals to active window 09:00 AM - 05:00 PM
  const busyIntervals: [number, number][] = [];
  for (const ev of todayEvents) {
    const s = Math.max(ACTIVE_DAY_START_MINUTES, ev.startMinutes);
    const e = Math.min(ACTIVE_DAY_END_MINUTES, ev.endMinutes);
    if (s < e) {
      busyIntervals.push([s, e]);
    }
  }

  // Merge overlapping or adjacent intervals
  busyIntervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  if (busyIntervals.length > 0) {
    let [currS, currE] = busyIntervals[0];
    for (let i = 1; i < busyIntervals.length; i++) {
      const [nextS, nextE] = busyIntervals[i];
      if (nextS <= currE) {
        currE = Math.max(currE, nextE);
      } else {
        merged.push([currS, currE]);
        currS = nextS;
        currE = nextE;
      }
    }
    merged.push([currS, currE]);
  }

  // Calculate open gaps
  const freeGaps: { start: number; end: number; duration: number }[] = [];
  let cursor = ACTIVE_DAY_START_MINUTES;

  for (const [s, e] of merged) {
    if (cursor < s) {
      freeGaps.push({ start: cursor, end: s, duration: s - cursor });
    }
    cursor = Math.max(cursor, e);
  }
  if (cursor < ACTIVE_DAY_END_MINUTES) {
    freeGaps.push({
      start: cursor,
      end: ACTIVE_DAY_END_MINUTES,
      duration: ACTIVE_DAY_END_MINUTES - cursor,
    });
  }

  if (freeGaps.length === 0) {
    return {
      timeRange: 'After 05:00 PM',
      subText: 'Classes scheduled throughout the day',
      isAllDay: false,
    };
  }

  // 1. Is user currently in an open free gap?
  const currentGap = freeGaps.find((g) => g.start <= currentMinutes && currentMinutes < g.end);
  if (currentGap) {
    const remaining = currentGap.end - currentMinutes;
    return {
      timeRange: `${minutesToTimeStr(currentGap.start)} – ${minutesToTimeStr(currentGap.end)}`,
      subText: `Currently free (${formatMinutesDuration(remaining)} remaining)`,
      isAllDay: false,
      durationMinutes: currentGap.duration,
    };
  }

  // 2. Next upcoming free gap today
  const nextGap = freeGaps.find((g) => g.start > currentMinutes);
  if (nextGap) {
    return {
      timeRange: `${minutesToTimeStr(nextGap.start)} – ${minutesToTimeStr(nextGap.end)}`,
      subText: `Available window (${formatMinutesDuration(nextGap.duration)})`,
      isAllDay: false,
      durationMinutes: nextGap.duration,
    };
  }

  // 3. Fallback when after all scheduled gaps
  return {
    timeRange: 'Evening is free',
    subText: 'Free after classes conclude',
    isAllDay: false,
  };
}

/**
 * Finds the earliest upcoming quiz or exam from today onwards.
 */
export function getUpcomingQuizOrExam(
  events: ScheduleEvent[] = SAMPLE_EVENTS,
  now: Date = new Date()
): UpcomingQuizInfo | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset <= 7; offset++) {
    const targetDate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const targetDayName = DAYS_OF_WEEK[targetDate.getDay()];
    const dayEvents = getEventsForDay(targetDayName, events);

    const quizzes = dayEvents.filter((e) => e.type === 'quiz' || e.type === 'exam');
    for (const q of quizzes) {
      if (offset === 0) {
        if (q.endMinutes > currentMinutes) {
          return {
            event: q,
            title: q.title,
            timeInfo: `Today • ${q.time}`,
            location: q.location,
            dayLabel: 'Today',
            type: q.type,
          };
        }
      } else {
        const dayLabel = offset === 1 ? 'Tomorrow' : targetDayName;
        return {
          event: q,
          title: q.title,
          timeInfo: `${dayLabel} • ${q.time}`,
          location: q.location,
          dayLabel,
          type: q.type,
        };
      }
    }
  }

  return null;
}
