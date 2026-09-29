import os
import sys
import unittest
from datetime import datetime

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.services.schedule_engine import (
    resolve_schedule,
    parse_time_to_minutes,
    minutes_to_time_str,
    calculate_free_windows,
    find_next_event,
    get_events_for_day,
    filter_events,
)

# Standard demo schedule events matching src/data/sampleSchedule.ts
DEMO_SCHEDULE = [
    {
        "id": "1",
        "time": "09:00 AM",
        "endTime": "10:00 AM",
        "durationMinutes": 60,
        "title": "Machine Learning",
        "location": "Room 204",
        "type": "class",
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "day": "Monday",
    },
    {
        "id": "2",
        "time": "11:00 AM",
        "endTime": "12:00 PM",
        "durationMinutes": 60,
        "title": "Natural Language Processing",
        "location": "Room 301",
        "type": "class",
        "days": ["Monday", "Wednesday", "Friday"],
        "day": "Monday",
    },
    {
        "id": "3",
        "time": "02:00 PM",
        "endTime": "03:00 PM",
        "durationMinutes": 60,
        "title": "Database Systems",
        "location": "Room 105",
        "type": "class",
        "days": ["Monday", "Tuesday", "Thursday"],
        "day": "Monday",
    },
    {
        "id": "4",
        "time": "04:00 PM",
        "endTime": "05:00 PM",
        "durationMinutes": 60,
        "title": "NLP Quiz",
        "location": "Room 204",
        "type": "quiz",
        "days": ["Wednesday"],
        "day": "Wednesday",
    },
]


class TestScheduleEngine(unittest.TestCase):

    def test_time_parsing(self):
        """Test robust parsing of 12-hour and 24-hour time strings."""
        self.assertEqual(parse_time_to_minutes("09:00 AM"), 540)
        self.assertEqual(parse_time_to_minutes("9:00 AM"), 540)
        self.assertEqual(parse_time_to_minutes("12:00 PM"), 720)   # Noon
        self.assertEqual(parse_time_to_minutes("12:00 AM"), 0)     # Midnight
        self.assertEqual(parse_time_to_minutes("02:00 PM"), 840)
        self.assertEqual(parse_time_to_minutes("05:00 PM"), 1020)
        self.assertEqual(parse_time_to_minutes("14:30"), 870)

        # Minutes to time string conversion
        self.assertEqual(minutes_to_time_str(540), "09:00 AM")
        self.assertEqual(minutes_to_time_str(720), "12:00 PM")
        self.assertEqual(minutes_to_time_str(0), "12:00 AM")
        self.assertEqual(minutes_to_time_str(840), "02:00 PM")
        self.assertEqual(minutes_to_time_str(1020), "05:00 PM")

    def test_monday_events(self):
        """Test resolving Monday events."""
        res = resolve_schedule(DEMO_SCHEDULE, day="Monday")
        self.assertEqual(res["targetDay"], "Monday")
        self.assertEqual(res["totalEvents"], 3)
        self.assertFalse(res["isCompletelyFree"])

        event_titles = [e["title"] for e in res["events"]]
        self.assertEqual(event_titles, ["Machine Learning", "Natural Language Processing", "Database Systems"])

        # Check times
        self.assertEqual(res["events"][0]["time"], "09:00 AM")
        self.assertEqual(res["events"][0]["endTime"], "10:00 AM")
        self.assertEqual(res["events"][1]["time"], "11:00 AM")
        self.assertEqual(res["events"][1]["endTime"], "12:00 PM")
        self.assertEqual(res["events"][2]["time"], "02:00 PM")
        self.assertEqual(res["events"][2]["endTime"], "03:00 PM")

    def test_afternoon_filtering(self):
        """Test filtering events by time-of-day: afternoon (12:00 PM – 05:00 PM)."""
        res = resolve_schedule(DEMO_SCHEDULE, day="Monday", time_of_day="afternoon")
        self.assertEqual(res["targetDay"], "Monday")
        self.assertEqual(res["totalEvents"], 1)

        event = res["events"][0]
        self.assertEqual(event["title"], "Database Systems")
        self.assertEqual(event["time"], "02:00 PM")
        self.assertEqual(event["endTime"], "03:00 PM")

        # Free windows within afternoon (12:00 PM - 05:00 PM)
        self.assertEqual(len(res["freeWindows"]), 2)
        self.assertEqual(res["freeWindows"][0]["start"], "12:00 PM")
        self.assertEqual(res["freeWindows"][0]["end"], "02:00 PM")
        self.assertEqual(res["freeWindows"][0]["durationMinutes"], 120)
        self.assertEqual(res["freeWindows"][1]["start"], "03:00 PM")
        self.assertEqual(res["freeWindows"][1]["end"], "05:00 PM")
        self.assertEqual(res["freeWindows"][1]["durationMinutes"], 120)

    def test_after_2pm_filtering(self):
        """Test filtering events after 02:00 PM."""
        res = resolve_schedule(DEMO_SCHEDULE, day="Monday", after_time="02:00 PM")
        self.assertEqual(res["totalEvents"], 1)
        self.assertEqual(res["events"][0]["title"], "Database Systems")
        self.assertEqual(res["events"][0]["time"], "02:00 PM")

        # After 03:00 PM should have 0 events on Monday
        res_after_3pm = resolve_schedule(DEMO_SCHEDULE, day="Monday", after_time="03:00 PM")
        self.assertEqual(res_after_3pm["totalEvents"], 0)
        self.assertTrue(res_after_3pm["isCompletelyFree"])

    def test_free_time_calculation(self):
        """
        Test exact free-time calculation on Monday within standard active hours (09:00 AM – 05:00 PM).
        Events:
          09:00–10:00 ML
          10:00–11:00 Free (60 min)
          11:00–12:00 NLP
          12:00–02:00 Free (120 min)
          02:00–03:00 DB Systems
          03:00–05:00 Free (120 min)
        """
        res = resolve_schedule(DEMO_SCHEDULE, day="Monday")
        free_windows = res["freeWindows"]
        self.assertEqual(len(free_windows), 3)

        self.assertEqual(free_windows[0]["start"], "10:00 AM")
        self.assertEqual(free_windows[0]["end"], "11:00 AM")
        self.assertEqual(free_windows[0]["durationMinutes"], 60)

        self.assertEqual(free_windows[1]["start"], "12:00 PM")
        self.assertEqual(free_windows[1]["end"], "02:00 PM")
        self.assertEqual(free_windows[1]["durationMinutes"], 120)

        self.assertEqual(free_windows[2]["start"], "03:00 PM")
        self.assertEqual(free_windows[2]["end"], "05:00 PM")
        self.assertEqual(free_windows[2]["durationMinutes"], 120)

        # Totals
        self.assertEqual(res["totalScheduledMinutes"], 180)  # 3 hours
        self.assertEqual(res["totalFreeMinutes"], 300)       # 5 hours
        self.assertEqual(res["longestFreeGapMinutes"], 120)

    def test_weekend_aggregation(self):
        """Test weekend query combining Saturday and Sunday."""
        res = resolve_schedule(DEMO_SCHEDULE, day="weekend")
        self.assertTrue(res["isWeekend"])
        self.assertEqual(res["totalEvents"], 0)
        self.assertTrue(res["isCompletelyFree"])
        self.assertIn("saturday", res["weekendBreakdown"])
        self.assertIn("sunday", res["weekendBreakdown"])
        self.assertEqual(len(res["weekendBreakdown"]["saturday"]["events"]), 0)
        self.assertEqual(len(res["weekendBreakdown"]["sunday"]["events"]), 0)

    def test_no_event_day(self):
        """Test resolving Sunday when no classes or events are scheduled."""
        res = resolve_schedule(DEMO_SCHEDULE, day="Sunday")
        self.assertEqual(res["targetDay"], "Sunday")
        self.assertEqual(res["totalEvents"], 0)
        self.assertTrue(res["isCompletelyFree"])
        self.assertEqual(res["totalScheduledMinutes"], 0)
        self.assertEqual(res["totalFreeMinutes"], 480)  # Whole 8-hour window free
        self.assertEqual(res["longestFreeGapMinutes"], 480)

    def test_busy_summary(self):
        """Test schedule density / busy metrics calculation."""
        # Monday (3 classes = 180 min scheduled) -> packed
        res_mon = resolve_schedule(DEMO_SCHEDULE, day="Monday")
        self.assertEqual(res_mon["totalEvents"], 3)
        self.assertEqual(res_mon["totalScheduledHours"], 3.0)
        self.assertTrue(res_mon["isPacked"])

        # Tuesday (2 classes = 120 min scheduled) -> not packed
        res_tue = resolve_schedule(DEMO_SCHEDULE, day="Tuesday")
        self.assertEqual(res_tue["totalEvents"], 2)
        self.assertEqual(res_tue["totalScheduledHours"], 2.0)
        self.assertFalse(res_tue["isPacked"])

    def test_next_event_lookahead(self):
        """Test finding the next upcoming event under different reference timestamps."""
        # Reference 1: Tuesday at 10:30 AM (between ML at 9:00 AM and DB Systems at 2:00 PM)
        # Using fixed date: Tuesday Sep 22, 2026 at 10:30 AM
        dt_tue_midday = datetime(2026, 9, 22, 10, 30)
        res_tue = resolve_schedule(DEMO_SCHEDULE, day="today", now=dt_tue_midday)
        next_ev = res_tue["nextEvent"]
        self.assertIsNotNone(next_ev)
        self.assertEqual(next_ev["title"], "Database Systems")
        self.assertEqual(next_ev["scheduledDay"], "Tuesday")
        self.assertTrue(next_ev["isToday"])
        self.assertEqual(next_ev["minutesUntilStart"], 210)  # 10:30 AM to 02:00 PM = 3.5 hrs = 210 mins

        # Reference 2: Tuesday at 04:00 PM (after DB Systems ends at 3:00 PM)
        # Should lookahead to Wednesday's first class (Machine Learning at 09:00 AM)
        dt_tue_afternoon = datetime(2026, 9, 22, 16, 0)
        res_tue_late = resolve_schedule(DEMO_SCHEDULE, day="today", now=dt_tue_afternoon)
        next_ev_late = res_tue_late["nextEvent"]
        self.assertIsNotNone(next_ev_late)
        self.assertEqual(next_ev_late["title"], "Machine Learning")
        self.assertEqual(next_ev_late["scheduledDay"], "Wednesday")
        self.assertTrue(next_ev_late["isTomorrow"])
        self.assertEqual(next_ev_late["time"], "09:00 AM")

        # Reference 3: Friday at 04:00 PM (weekend has no events; should roll over to Monday 09:00 AM)
        dt_fri_late = datetime(2026, 9, 25, 16, 0)
        next_ev_fri = find_next_event(DEMO_SCHEDULE, now=dt_fri_late)
        self.assertIsNotNone(next_ev_fri)
        self.assertEqual(next_ev_fri["title"], "Machine Learning")
        self.assertEqual(next_ev_fri["scheduledDay"], "Monday")
        self.assertEqual(next_ev_fri["daysAhead"], 3)

    def test_wednesday_nlp_quiz_and_boundaries(self):
        """Test Wednesday schedule with NLP Quiz ending exactly at 05:00 PM."""
        res = resolve_schedule(DEMO_SCHEDULE, day="Wednesday")
        self.assertEqual(res["totalEvents"], 3)
        self.assertEqual(res["events"][2]["title"], "NLP Quiz")
        self.assertEqual(res["events"][2]["time"], "04:00 PM")
        self.assertEqual(res["events"][2]["endTime"], "05:00 PM")

        # Free windows should have 10:00 AM - 11:00 AM and 12:00 PM - 04:00 PM (4-hour gap!)
        self.assertEqual(len(res["freeWindows"]), 2)
        self.assertEqual(res["freeWindows"][0]["label"], "10:00 AM – 11:00 AM (1 hr)")
        self.assertEqual(res["freeWindows"][1]["label"], "12:00 PM – 04:00 PM (4 hrs)")
        self.assertEqual(res["longestFreeGapMinutes"], 240)
        self.assertEqual(res["totalFreeMinutes"], 300)

    def test_overlapping_and_back_to_back_events(self):
        """Test calculation when events overlap or are scheduled back-to-back."""
        overlap_schedule = [
            {"id": "a", "time": "09:00 AM", "endTime": "10:30 AM", "title": "Lab A", "day": "Thursday"},
            {"id": "b", "time": "10:00 AM", "endTime": "11:00 AM", "title": "Seminar B", "day": "Thursday"},
            {"id": "c", "time": "11:00 AM", "endTime": "12:00 PM", "title": "Lecture C", "day": "Thursday"},
        ]
        res = resolve_schedule(overlap_schedule, day="Thursday")
        self.assertEqual(res["totalEvents"], 3)
        self.assertTrue(res["hasBackToBack"])  # B ends at 11:00 AM and C starts at 11:00 AM

        # Merged busy period covers 09:00 AM to 12:00 PM
        # Free window should be from 12:00 PM to 05:00 PM (300 min)
        self.assertEqual(len(res["freeWindows"]), 1)
        self.assertEqual(res["freeWindows"][0]["start"], "12:00 PM")
        self.assertEqual(res["freeWindows"][0]["end"], "05:00 PM")
        self.assertEqual(res["freeWindows"][0]["durationMinutes"], 300)

    def test_empty_schedule(self):
        """Test handling empty schedule cleanly without errors."""
        res = resolve_schedule([], day="Monday")
        self.assertEqual(res["totalEvents"], 0)
        self.assertTrue(res["isCompletelyFree"])
        self.assertIsNone(res["nextEvent"])
        self.assertEqual(res["totalFreeMinutes"], 480)
        self.assertEqual(len(res["freeWindows"]), 1)
        self.assertEqual(res["freeWindows"][0]["label"], "09:00 AM – 05:00 PM (8 hrs)")


if __name__ == "__main__":
    unittest.main()

