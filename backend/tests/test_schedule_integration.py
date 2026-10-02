import json
import os
import sys
import unittest
from datetime import datetime
from typing import Dict, Any, List

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.schemas.tools import NVIDIA_TOOLS
from backend.app.services.prompt_builder import build_system_prompt
from backend.app.services.nvidia_client import (
    resolve_schedule_query,
    READ_ONLY_SCHEDULE_TOOLS,
    ParsedToolCall,
)
from backend.app.models.chat import UserContext, ChatMessage

DEMO_SCHEDULE: List[Dict[str, Any]] = [
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


class TestScheduleIntegration(unittest.TestCase):

    def test_get_schedule_tool_schema(self):
        """Verify that get_schedule in NVIDIA_TOOLS is properly expanded."""
        sched_tool = next(
            (t for t in NVIDIA_TOOLS if t.get("function", {}).get("name") == "get_schedule"),
            None
        )
        self.assertIsNotNone(sched_tool)
        params = sched_tool["function"]["parameters"]["properties"]
        self.assertIn("day", params)
        self.assertIn("time_of_day", params)
        self.assertIn("after_time", params)
        self.assertIn("before_time", params)
        self.assertIn("query_type", params)

        # Check enum values
        self.assertIn("weekend", params["day"]["enum"])
        self.assertIn("morning", params["time_of_day"]["enum"])
        self.assertIn("afternoon", params["time_of_day"]["enum"])
        self.assertIn("evening", params["time_of_day"]["enum"])
        self.assertIn("availability", params["query_type"]["enum"])
        self.assertIn("free_time", params["query_type"]["enum"])

    def test_prompt_builder_schedule_instructions(self):
        """Verify prompt builder gives proactive instructions and removes legacy negative constraint."""
        prompt = build_system_prompt()
        self.assertNotIn("DO NOT invoke get_schedule for informational schedule questions", prompt)
        self.assertIn("get_schedule", prompt)
        self.assertIn("authoritative", prompt.lower())
        self.assertIn("DATA INTEGRITY & ANTI-HALLUCINATION", prompt)

    def test_1_get_schedule_events_query(self):
        """1. Test day='Monday', query_type='events'."""
        result = resolve_schedule_query(
            day_arg="Monday",
            schedule=DEMO_SCHEDULE,
            query_type="events"
        )
        self.assertEqual(result["targetDay"], "Monday")
        self.assertEqual(result["totalEvents"], 3)
        titles = [e["title"] for e in result["events"]]
        self.assertEqual(titles, ["Machine Learning", "Natural Language Processing", "Database Systems"])
        self.assertIn("summaryText", result)
        self.assertTrue(len(result["summaryText"]) > 0)

    def test_2_afternoon_availability(self):
        """2. Test day='Monday', time_of_day='afternoon', query_type='availability'."""
        result = resolve_schedule_query(
            day_arg="Monday",
            schedule=DEMO_SCHEDULE,
            time_of_day="afternoon",
            query_type="availability"
        )
        self.assertEqual(result["totalEvents"], 1)
        self.assertEqual(result["events"][0]["title"], "Database Systems")
        # Afternoon window (12:00 PM – 05:00 PM) has two 2-hour gaps: 12-2 PM and 3-5 PM
        self.assertEqual(len(result["freeWindows"]), 2)
        self.assertEqual(result["freeWindows"][0]["start"], "12:00 PM")
        self.assertEqual(result["freeWindows"][0]["end"], "02:00 PM")
        self.assertEqual(result["freeWindows"][1]["start"], "03:00 PM")
        self.assertEqual(result["freeWindows"][1]["end"], "05:00 PM")

    def test_3_after_time_query(self):
        """3. Test day='Monday', after_time='02:00 PM', query_type='events'."""
        result = resolve_schedule_query(
            day_arg="Monday",
            schedule=DEMO_SCHEDULE,
            after_time="02:00 PM",
            query_type="events"
        )
        self.assertEqual(result["totalEvents"], 1)
        self.assertEqual(result["events"][0]["title"], "Database Systems")

        # After 03:00 PM on Monday -> 0 events
        result_after_3 = resolve_schedule_query(
            day_arg="Monday",
            schedule=DEMO_SCHEDULE,
            after_time="03:00 PM",
            query_type="events"
        )
        self.assertEqual(result_after_3["totalEvents"], 0)
        self.assertTrue(result_after_3["isCompletelyFree"])

    def test_4_busy_summary(self):
        """4. Test day='Monday', query_type='busy_summary'."""
        result = resolve_schedule_query(
            day_arg="Monday",
            schedule=DEMO_SCHEDULE,
            query_type="busy_summary"
        )
        self.assertEqual(result["totalEvents"], 3)
        self.assertEqual(result["totalScheduledMinutes"], 180)
        self.assertEqual(result["totalFreeMinutes"], 300)
        self.assertTrue(result["isPacked"])

    def test_5_weekend_query(self):
        """5. Test day='weekend', query_type='events'."""
        result = resolve_schedule_query(
            day_arg="weekend",
            schedule=DEMO_SCHEDULE,
            query_type="events"
        )
        self.assertTrue(result["isWeekend"])
        self.assertEqual(result["totalEvents"], 0)
        self.assertTrue(result["isCompletelyFree"])
        self.assertIn("weekendBreakdown", result)
        self.assertIn("saturday", result["weekendBreakdown"])
        self.assertIn("sunday", result["weekendBreakdown"])

    def test_6_next_event_lookahead(self):
        """6. Test deterministic next-event result with fixed reference datetime."""
        # Fixed reference date: Tuesday Sep 22, 2026 at 10:30 AM
        fixed_dt = datetime(2026, 9, 22, 10, 30)
        result = resolve_schedule_query(
            day_arg="today",
            schedule=DEMO_SCHEDULE,
            query_type="next_event",
            now=fixed_dt
        )
        next_ev = result["nextEvent"]
        self.assertIsNotNone(next_ev)
        self.assertEqual(next_ev["title"], "Database Systems")
        self.assertEqual(next_ev["scheduledDay"], "Tuesday")
        self.assertEqual(next_ev["minutesUntilStart"], 210)

    def test_7_frontend_payload_metadata_preservation(self):
        """
        7. Verify that resolve_schedule_query processes events containing endTime and durationMinutes.
        (Note: TypeScript client serialization is also validated via tsc / typechecking).
        """
        rich_event = {
            "id": "test_1",
            "title": "Deep Learning Seminar",
            "time": "10:00 AM",
            "endTime": "11:30 AM",
            "durationMinutes": 90,
            "location": "Auditorium",
            "type": "class",
            "days": ["Friday"],
        }
        res = resolve_schedule_query(
            day_arg="Friday",
            schedule=[rich_event],
            query_type="events"
        )
        self.assertEqual(res["totalEvents"], 1)
        ev = res["events"][0]
        self.assertEqual(ev["endTime"], "11:30 AM")
        self.assertEqual(ev["durationMinutes"], 90)

    def test_8_mutation_regression(self):
        """
        8. Verify that mutation tools remain distinct from READ_ONLY_SCHEDULE_TOOLS
        and are never suppressed as read-only.
        """
        mutating_tool_names = [
            "create_task", "update_task", "complete_task", "delete_task",
            "create_note", "update_note", "delete_note",
            "create_plan", "update_plan", "complete_plan",
            "create_reminder", "update_reminder", "complete_reminder", "delete_reminder"
        ]
        for tool_name in mutating_tool_names:
            self.assertNotIn(
                tool_name,
                READ_ONLY_SCHEDULE_TOOLS,
                f"Mutating tool {tool_name} must NOT be in READ_ONLY_SCHEDULE_TOOLS"
            )


if __name__ == "__main__":
    unittest.main()
