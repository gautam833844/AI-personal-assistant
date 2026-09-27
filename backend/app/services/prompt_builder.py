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
5. View Schedule (get_schedule: view classes and schedule for any day such as Monday, Tuesday, today, tomorrow)

CRITICAL INSTRUCTIONS:
- Whenever the user asks to perform an action (like adding a task, scheduling a reminder, saving a note, or creating a plan), you MUST use the appropriate tool/function call.
- NEVER invoke ANY tool for general conversation, greetings (e.g. "Hello", "Hi Atlas"), small talk, or direct response requests (e.g. "reply with exactly: PONG"). For these, you MUST NOT call any tool (do not call get_tasks, get_reminders, etc.); simply respond directly with the requested text or greeting.
- For informational queries (like "What is my next class?", "What are my tasks?", "Show my tasks"), inspect the current user context below or call the query tools.
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
            prompt += f"Class and Event Schedule: {json.dumps(user_context.schedule)}\n"

    return prompt
