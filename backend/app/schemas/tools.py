from typing import List, Dict, Any

NVIDIA_TOOLS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 1. TASK TOOLS
    # -------------------------------------------------------------------------
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new task for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title or action of the task (e.g. 'Study NLP', 'Prepare Atlas PPT')"
                    },
                    "dateCategory": {
                        "type": "string",
                        "enum": ["today", "upcoming"],
                        "description": "Whether the task is scheduled for today or an upcoming/future date"
                    },
                    "dateLabel": {
                        "type": "string",
                        "description": "Human-readable date label, e.g. 'Today', 'Tomorrow', 'Friday'"
                    },
                    "time": {
                        "type": "string",
                        "description": "Time formatted with AM/PM (e.g. '06:00 PM', '10:00 AM')"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "normal", "high"],
                        "description": "Priority level of the task"
                    }
                },
                "required": ["title", "dateCategory", "priority"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update an existing task's title, time, or priority.",
            "parameters": {
                "type": "object",
                "properties": {
                    "taskId": {
                        "type": "string",
                        "description": "The ID of the task to update"
                    },
                    "title": {"type": "string", "description": "New title for the task"},
                    "time": {"type": "string", "description": "New time formatted e.g. '05:00 PM'"},
                    "dateCategory": {"type": "string", "enum": ["today", "upcoming"]},
                    "priority": {"type": "string", "enum": ["low", "normal", "high"]}
                },
                "required": ["taskId"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark an existing task as completed or toggle its status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "taskId": {
                        "type": "string",
                        "description": "The exact ID of the task to mark as completed"
                    },
                    "taskTitle": {
                        "type": "string",
                        "description": "The title of the task for human reference"
                    }
                },
                "required": ["taskId", "taskTitle"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete an existing task permanently.",
            "parameters": {
                "type": "object",
                "properties": {
                    "taskId": {
                        "type": "string",
                        "description": "The exact ID of the task to delete"
                    },
                    "taskTitle": {
                        "type": "string",
                        "description": "The title of the task to delete"
                    }
                },
                "required": ["taskId", "taskTitle"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_tasks",
            "description": "Retrieve the user's tasks list.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter by task completion status"
                    }
                }
            }
        }
    },

    # -------------------------------------------------------------------------
    # 2. NOTE TOOLS
    # -------------------------------------------------------------------------
    {
        "type": "function",
        "function": {
            "name": "create_note",
            "description": "Create a new personal note, thought, or idea.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the note"
                    },
                    "content": {
                        "type": "string",
                        "description": "Detailed text content of the note"
                    },
                    "pinned": {
                        "type": "boolean",
                        "description": "Whether the note is pinned to top"
                    }
                },
                "required": ["title", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_note",
            "description": "Update an existing note's title, content, or pinned state.",
            "parameters": {
                "type": "object",
                "properties": {
                    "noteId": {
                        "type": "string",
                        "description": "The ID of the note to update"
                    },
                    "title": {"type": "string"},
                    "content": {"type": "string"},
                    "pinned": {"type": "boolean"}
                },
                "required": ["noteId"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_note",
            "description": "Delete an existing note permanently.",
            "parameters": {
                "type": "object",
                "properties": {
                    "noteId": {
                        "type": "string",
                        "description": "The exact ID of the note to delete"
                    },
                    "noteTitle": {
                        "type": "string",
                        "description": "The title of the note"
                    }
                },
                "required": ["noteId", "noteTitle"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_notes",
            "description": "Retrieve all saved personal notes.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    # -------------------------------------------------------------------------
    # 3. PLAN TOOLS
    # -------------------------------------------------------------------------
    {
        "type": "function",
        "function": {
            "name": "create_plan",
            "description": "Create a new project plan or overarching goal.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name or goal of the plan"
                    },
                    "targetDate": {
                        "type": "string",
                        "description": "Target completion date (e.g. 'Oct 30', 'Next Month')"
                    },
                    "description": {
                        "type": "string",
                        "description": "Brief description of the plan"
                    }
                },
                "required": ["name", "targetDate"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_plan",
            "description": "Update an existing plan's name, target date, or description.",
            "parameters": {
                "type": "object",
                "properties": {
                    "planId": {"type": "string", "description": "The ID of the plan to update"},
                    "name": {"type": "string"},
                    "targetDate": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["planId"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_plan",
            "description": "Mark an entire plan as completed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "planId": {
                        "type": "string",
                        "description": "The ID of the plan to mark as completed"
                    },
                    "planName": {
                        "type": "string",
                        "description": "The name of the plan"
                    }
                },
                "required": ["planId", "planName"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_plans",
            "description": "Retrieve all current plans and goals.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    # -------------------------------------------------------------------------
    # 4. REMINDER TOOLS
    # -------------------------------------------------------------------------
    {
        "type": "function",
        "function": {
            "name": "create_reminder",
            "description": "Create a scheduled reminder.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title or reminder text (e.g. 'Call supplier')"
                    },
                    "dateCategory": {
                        "type": "string",
                        "enum": ["today", "upcoming"],
                        "description": "Whether the reminder is for today or upcoming"
                    },
                    "dateLabel": {
                        "type": "string",
                        "description": "Date label e.g. 'Today', 'Tomorrow'"
                    },
                    "time": {
                        "type": "string",
                        "description": "Time e.g. '04:00 PM', '10:00 AM'"
                    }
                },
                "required": ["title", "dateCategory", "time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_reminder",
            "description": "Update an existing reminder.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reminderId": {"type": "string"},
                    "title": {"type": "string"},
                    "dateCategory": {"type": "string", "enum": ["today", "upcoming"]},
                    "dateLabel": {"type": "string"},
                    "time": {"type": "string"}
                },
                "required": ["reminderId"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_reminder",
            "description": "Mark a reminder as completed/resolved.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reminderId": {
                        "type": "string",
                        "description": "The ID of the reminder"
                    },
                    "reminderTitle": {
                        "type": "string",
                        "description": "The title of the reminder"
                    }
                },
                "required": ["reminderId", "reminderTitle"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_reminder",
            "description": "Delete a reminder permanently.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reminderId": {
                        "type": "string",
                        "description": "The ID of the reminder to delete"
                    },
                    "reminderTitle": {
                        "type": "string",
                        "description": "The title of the reminder"
                    }
                },
                "required": ["reminderId", "reminderTitle"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_reminders",
            "description": "Retrieve all reminders. Call this ONLY when the user explicitly asks to view, check, or list reminders.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    # -------------------------------------------------------------------------
    # 5. SCHEDULE TOOLS
    # -------------------------------------------------------------------------
    {
        "type": "function",
        "function": {
            "name": "get_schedule",
            "description": "Retrieve the class, exam, or event schedule for a specific day such as Monday, Tuesday, today, or tomorrow.",
            "parameters": {
                "type": "object",
                "properties": {
                    "day": {
                        "type": "string",
                        "enum": [
                            "today",
                            "tomorrow",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday"
                        ],
                        "description": "Day of the week or relative day to inspect (e.g. 'Monday', 'Tuesday', 'today', 'tomorrow')"
                    }
                }
            }
        }
    }
]
