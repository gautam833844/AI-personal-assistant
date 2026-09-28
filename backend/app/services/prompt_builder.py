import json
from datetime import datetime
from typing import Optional
from ..models.chat import UserContext

def build_system_prompt(user_context: Optional[UserContext] = None) -> str:
    now_str = datetime.now().strftime("%A, %b %d, %Y, %I:%M %p")
    user_name = user_context.userName if user_context and user_context.userName else "Gautam"
    assistant_name = user_context.assistantName if user_context and user_context.assistantName else "Atlas"

    prompt = f"""You are {assistant_name}, a friendly, ultra-competent personal AI assistant for {user_name}.
Current Date and Time: {now_str}.

Your capabilities:
1. Manage Tasks (create_task, update_task, complete_task, delete_task, get_tasks)
2. Manage Notes (create_note, update_note, delete_note, get_notes)
3. Manage Plans & Goals (create_plan, update_plan, complete_plan, get_plans)
4. Manage Reminders (create_reminder, update_reminder, complete_reminder, delete_reminder, get_reminders)
5. View Schedule (get_schedule: view classes, quizzes, exams, and events for any day such as Monday, Tuesday, today, tomorrow)

CRITICAL INSTRUCTIONS:
- Whenever the user asks to perform an action (like adding a task, scheduling a reminder, saving a note, or creating a plan), you MUST use the appropriate tool/function call.
- NEVER invoke ANY tool for general conversation, greetings (e.g. "Hello", "Hi Atlas"), small talk, or direct response requests (e.g. "reply with exactly: PONG"). For these, you MUST NOT call any tool; simply respond directly with the requested text or greeting.
- For schedule questions (e.g. "What are my classes on Monday?", "What is my Tuesday schedule?", "What quizzes on Wednesday?", "Do I have a class at 2 PM?"), invoke the `get_schedule` tool with the appropriate `day` and optional `eventType`, and describe the events accurately from the supplied context.
- DATA INTEGRITY & ANTI-HALLUCINATION:
  * You must NEVER invent, fabricate, or assume class names, times, rooms, instructors, quizzes, or exams.
  * Schedule information is authoritative ONLY when present in the supplied User Context below.
  * If a requested day or time has no events listed in the supplied schedule, explicitly state that no classes or events are scheduled for that time/day.
- Keep your tone concise, helpful, and polite.
- When you invoke a tool, also provide a short, conversational response explaining what you are preparing to do for the user.

"""

    if user_context:
        prompt += "\n--- CURRENT USER CONTEXT ---\n"
        if user_context.degree or user_context.branch:
            prompt += f"Education: {user_context.degree or ''} in {user_context.branch or ''}\n"

        if user_context.tasks:
            prompt += f"Active Tasks: {json.dumps(user_context.tasks)}\n"
        if user_context.plans:
            prompt += f"Active Plans: {json.dumps(user_context.plans)}\n"
        if user_context.notes:
            prompt += f"Recent Notes: {json.dumps(user_context.notes)}\n"
        if user_context.reminders:
            prompt += f"Active Reminders: {json.dumps(user_context.reminders)}\n"
        if user_context.schedule:
            # Build human-readable day-by-day timetable
            days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            schedule_by_day = {d: [] for d in days_of_week}
            unassigned_events = []

            for event in user_context.schedule:
                title = event.get("title", "Event")
                time_str = event.get("time", "")
                loc = event.get("location", "")
                etype = event.get("type", "class")
                desc = f"{title} ({etype}) at {time_str}" + (f" in {loc}" if loc else "")

                event_days = event.get("days") or ([event.get("day")] if event.get("day") else [])
                if event_days:
                    for d in event_days:
                        # Match day case-insensitively
                        matched_day = next((day_name for day_name in days_of_week if day_name.lower() == str(d).lower()), None)
                        if matched_day:
                            schedule_by_day[matched_day].append(desc)
                        else:
                            unassigned_events.append(f"{desc} (on {d})")
                else:
                    unassigned_events.append(desc)

            prompt += "Class and Event Schedule (Authoritative Timetable):\n"
            for d in days_of_week:
                events_for_day = schedule_by_day[d]
                if events_for_day:
                    prompt += f"  - {d}: {'; '.join(events_for_day)}\n"
                else:
                    prompt += f"  - {d}: No classes or events scheduled\n"

            if unassigned_events:
                prompt += f"  - Other / Specific Date Events: {'; '.join(unassigned_events)}\n"

    return prompt
