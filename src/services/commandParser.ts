import { CommandResult } from '../types/command';
import { Task } from '../types/task';
import { Plan } from '../types/plan';
import { Note } from '../types/note';
import { Reminder } from '../types/reminder';
import { SAMPLE_EVENTS } from '../data/sampleSchedule';

export interface ParserContext {
  userName?: string;
  assistantName?: string;
  tasks?: Task[];
  plans?: Plan[];
  notes?: Note[];
  reminders?: Reminder[];
}

/**
 * Utility to extract time from natural language input.
 * Handles: "6 pm", "6:30 pm", "at 5 PM", "evening" -> "06:00 PM", "morning" -> "09:00 AM", "afternoon" -> "02:00 PM", "night" -> "08:00 PM"
 */
function extractTime(text: string): { time?: string; cleanText: string } {
  // Explicit time: 5 pm, 5:30 am, 18:00
  const timeRegex = /(?:at\s+)?(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|\b\d{1,2}:\d{2}\b)/i;
  const match = text.match(timeRegex);

  if (match) {
    let rawTime = match[1].trim().toUpperCase();
    if (!rawTime.includes(':') && (rawTime.includes('AM') || rawTime.includes('PM'))) {
      const parts = rawTime.match(/(\d+)\s*(AM|PM)/i);
      if (parts) {
        rawTime = `${parts[1]}:00 ${parts[2]}`;
      }
    }
    const cleanText = text.replace(match[0], '').trim();
    return { time: rawTime, cleanText };
  }

  // Word-based time of day
  if (/\b(?:in\s+the\s+)?evening\b/i.test(text)) {
    return { time: '06:00 PM', cleanText: text.replace(/\b(?:in\s+the\s+)?evening\b/i, '').trim() };
  }
  if (/\b(?:in\s+the\s+)?morning\b/i.test(text)) {
    return { time: '09:00 AM', cleanText: text.replace(/\b(?:in\s+the\s+)?morning\b/i, '').trim() };
  }
  if (/\b(?:in\s+the\s+)?afternoon\b/i.test(text)) {
    return { time: '02:00 PM', cleanText: text.replace(/\b(?:in\s+the\s+)?afternoon\b/i, '').trim() };
  }
  if (/\b(?:at\s+)?night\b/i.test(text)) {
    return { time: '08:00 PM', cleanText: text.replace(/\b(?:at\s+)?night\b/i, '').trim() };
  }

  return { cleanText: text };
}

/**
 * Utility to extract date category from text (today vs tomorrow/upcoming).
 */
function extractDate(text: string): {
  dateCategory: 'today' | 'upcoming';
  dateLabel: string;
  cleanText: string;
} {
  const tomorrowRegex = /\b(tomorrow|next week|later)\b/i;
  const todayRegex = /\b(today|tonight)\b/i;

  if (tomorrowRegex.test(text)) {
    return {
      dateCategory: 'upcoming',
      dateLabel: 'Tomorrow',
      cleanText: text.replace(tomorrowRegex, '').trim(),
    };
  }

  if (todayRegex.test(text)) {
    return {
      dateCategory: 'today',
      dateLabel: 'Today',
      cleanText: text.replace(todayRegex, '').trim(),
    };
  }

  return {
    dateCategory: 'today',
    dateLabel: 'Today',
    cleanText: text,
  };
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractWeekday(text: string): string | undefined {
  const match = text.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
  );
  return match ? capitalize(match[1]) : undefined;
}

/**
 * Match a target item in an array by substring / word overlap
 */
function findBestMatch<T extends { id: string; title?: string; name?: string }>(
  query: string,
  items?: T[]
): T | undefined {
  if (!items || items.length === 0) return undefined;
  const qLower = query.toLowerCase().trim();

  // 1. Exact match
  const exact = items.find(
    (item) => (item.title || item.name || '').toLowerCase() === qLower
  );
  if (exact) return exact;

  // 2. Includes match
  const includes = items.find(
    (item) =>
      (item.title || item.name || '').toLowerCase().includes(qLower) ||
      qLower.includes((item.title || item.name || '').toLowerCase())
  );
  if (includes) return includes;

  // 3. Word token overlap
  const qWords = qLower.split(/\s+/).filter((w) => w.length > 2);
  let bestItem: T | undefined;
  let maxScore = 0;

  for (const item of items) {
    const itemWords = (item.title || item.name || '').toLowerCase().split(/\s+/);
    let score = 0;
    for (const qw of qWords) {
      if (itemWords.some((iw) => iw.includes(qw) || qw.includes(iw))) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestItem = item;
    }
  }

  return maxScore > 0 ? bestItem : undefined;
}

/**
 * Enhanced deterministic local command parser
 */
export function parseCommand(rawInput: string, context?: ParserContext): CommandResult {
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();
  const userName = context?.userName || 'Gautam';
  const tasks = context?.tasks || [];
  const notes = context?.notes || [];
  const plans = context?.plans || [];
  const reminders = context?.reminders || [];

  if (!trimmed) {
    return {
      action: 'unknown',
      confidence: 0.1,
      payload: {},
      response: "Please enter a request or command.",
    };
  }

  // -------------------------------------------------------------------------
  // 1. GREETINGS
  // -------------------------------------------------------------------------
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|namaste)\b/i.test(lower)) {
    return {
      action: 'greeting',
      confidence: 0.99,
      payload: {},
      response: `Hi ${userName} 👋 How can I help?`,
      requiresConfirmation: false,
    };
  }

  // -------------------------------------------------------------------------
  // 2. CONTEXTUAL QUERIES: NEXT CLASS / SCHEDULE
  // -------------------------------------------------------------------------
  if (
    /(what('?s|\s+is)\s+(my\s+)?next\s+class|next\s+class|when('?s|\s+is)\s+(my\s+)?next\s+class|upcoming\s+class)/i.test(
      lower
    )
  ) {
    // Find next upcoming class from schedule
    const nextClass = SAMPLE_EVENTS.find((e) => e.type === 'class') || SAMPLE_EVENTS[0];
    const details = nextClass
      ? `Your next class is **${nextClass.title}** at **${nextClass.time}** in ${nextClass.location}.`
      : 'You have no more classes scheduled for today.';

    return {
      action: 'show_next_class',
      confidence: 0.98,
      payload: { nextClass },
      response: details,
      requiresConfirmation: false,
    };
  }

  // "What do I have tomorrow?" / "Tomorrow agenda"
  if (
    /(what\s+do\s+i\s+have\s+tomorrow|what('?s|\s+is)\s+(on\s+for\s+)?tomorrow|tomorrow('?s)?\s+(agenda|schedule|tasks)|what\s+is\s+scheduled\s+for\s+tomorrow)/i.test(
      lower
    )
  ) {
    const upcomingTasks = tasks.filter((t) => t.dateCategory === 'upcoming' && !t.completed);
    const upcomingRemindersList = reminders.filter((r) => r.dateCategory === 'upcoming' && !r.completed);

    let summary = `Here is what you have for **Tomorrow**:\n\n📅 **Event**: NLP Quiz at 10:00 AM (Room 204)`;
    if (upcomingTasks.length > 0) {
      summary += `\n\n✅ **Upcoming Tasks** (${upcomingTasks.length}):\n` +
        upcomingTasks.map((t) => `• ${t.title} (${t.time || 'All Day'})`).join('\n');
    }
    if (upcomingRemindersList.length > 0) {
      summary += `\n\n⏰ **Reminders**:\n` +
        upcomingRemindersList.map((r) => `• ${r.title} at ${r.time}`).join('\n');
    }

    return {
      action: 'show_tomorrow',
      confidence: 0.96,
      payload: { upcomingTasks, upcomingRemindersList },
      response: summary,
      requiresConfirmation: false,
    };
  }

  // Day-specific Schedule & Classes (e.g. "Do I have any classes on Sunday", "What classes do I have on Monday", "Show Monday's schedule")
  const targetDay = extractWeekday(lower);
  const daySchedulePatterns = [
    /(?:do\s+i\s+have\s+(?:any\s+)?(?:classes|class|anything(?:\s+scheduled)?)|what\s+(?:classes|class|schedule)?\s*do\s+i\s+have|what\s+do\s+i\s+have)\s+(?:for|on)\s+/i,
    /(?:what(?:'s|\s+is|\s+are)\s+(?:my|the)?\s*(?:classes|class|schedule)|show\s+(?:me\s+)?(?:my\s+)?(?:classes|class|schedule)|view\s+(?:classes|class|schedule))\s+(?:for|on)\s+/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)('?s)?\s+(?:classes|class|schedule)\b/i,
    /(?:classes|class|schedule)\s+(?:for|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /(?:anything\s+scheduled|do\s+i\s+have\s+anything|what\s+do\s+i\s+have)\s+(?:for|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  ];

  const isDayScheduleQuery = Boolean(
    targetDay && daySchedulePatterns.some((pattern) => pattern.test(lower))
  );

  if (isDayScheduleQuery && targetDay) {
    const day = targetDay;
    const dayLower = day.toLowerCase();
    const classes = SAMPLE_EVENTS.filter(
      (e) =>
        e.type === 'class' &&
        (e.days?.some((d) => d.toLowerCase() === dayLower) ||
          e.day?.toLowerCase() === dayLower)
    );

    if (classes.length === 0) {
      return {
        action: 'get_schedule',
        confidence: 0.98,
        payload: { day },
        response: `You have no classes scheduled for **${day}**.`,
        requiresConfirmation: false,
      };
    }

    const classLines = classes
      .map((c) => `• **${c.title}** at ${c.time} (${c.location})`)
      .join('\n');

    return {
      action: 'get_schedule',
      confidence: 0.98,
      payload: { day },
      response: `Here are your classes scheduled for **${day}**:\n\n${classLines}`,
      requiresConfirmation: false,
    };
  }

  // Schedule read-only (today / general)
  if (
    /(what('?s|\s+is)\s+(on\s+)?(my\s+)?schedule|show\s+(my\s+)?schedule|view\s+schedule|my\s+classes|my\s+schedule)/i.test(
      lower
    )
  ) {
    return {
      action: 'show_schedule',
      confidence: 0.95,
      payload: {},
      response: "Here is what's on your schedule for today:",
      requiresConfirmation: false,
    };
  }

  // -------------------------------------------------------------------------
  // 3. CONTEXTUAL QUERIES: LIST TASKS, NOTES, PLANS, REMINDERS
  // -------------------------------------------------------------------------
  if (
    /(what\s+are\s+my\s+pending\s+tasks|show\s+(my\s+)?(pending\s+)?tasks|list\s+tasks|view\s+tasks|get\s+tasks)/i.test(
      lower
    )
  ) {
    return {
      action: 'list_tasks',
      confidence: 0.95,
      payload: {},
      response: "Here are your current tasks:",
      requiresConfirmation: false,
    };
  }

  if (
    /(what\s+plans\s+am\s+i\s+working\s+on|show\s+(my\s+)?plans|list\s+plans|view\s+plans|my\s+goals)/i.test(
      lower
    )
  ) {
    return {
      action: 'list_plans',
      confidence: 0.95,
      payload: {},
      response: "Here are your active plans & goals:",
      requiresConfirmation: false,
    };
  }

  if (
    /(show|list|view|what\s+are)\s+(my\s+)?notes|get\s+notes/i.test(lower)
  ) {
    return {
      action: 'list_notes',
      confidence: 0.95,
      payload: {},
      response: "Here are your notes:",
      requiresConfirmation: false,
    };
  }

  if (
    /(show|list|view|what\s+are)\s+(my\s+)?reminders|get\s+reminders/i.test(
      lower
    )
  ) {
    return {
      action: 'list_reminders',
      confidence: 0.95,
      payload: {},
      response: "Here are your scheduled reminders:",
      requiresConfirmation: false,
    };
  }

  // -------------------------------------------------------------------------
  // 4. COMPLETE / DONE ACTIONS (Tasks, Plans, Reminders)
  // -------------------------------------------------------------------------
  // Task completion: e.g. "complete task study NLP", "mark study NLP as done", "done with study NLP"
  const completeTaskMatch = lower.match(
    /(?:mark\s+(?:task\s+)?(.+?)\s+as\s+(?:done|completed?)|complete\s+(?:task\s+)?(.+)|done\s+with\s+(?:task\s+)?(.+))/i
  );
  if (completeTaskMatch) {
    const rawTarget = completeTaskMatch[1] || completeTaskMatch[2] || completeTaskMatch[3];
    const target = rawTarget.replace(/\b(task|the)\b/gi, '').trim();
    const matchedTask = findBestMatch(target, tasks);

    if (matchedTask) {
      return {
        action: 'complete_task',
        confidence: 0.95,
        payload: {
          taskId: matchedTask.id,
          title: matchedTask.title,
        },
        response: `I found the task: "${matchedTask.title}".\nWould you like to mark it as completed?`,
        requiresConfirmation: true,
      };
    }
  }

  // Plan completion: e.g. "mark plan Atlas Project as completed", "complete plan Atlas"
  const completePlanMatch = lower.match(
    /(?:mark\s+(?:plan\s+)?(.+?)\s+as\s+(?:done|completed?)|complete\s+(?:plan\s+)?(.+))/i
  );
  if (completePlanMatch) {
    const rawTarget = completePlanMatch[1] || completePlanMatch[2];
    const target = rawTarget.replace(/\b(plan|the)\b/gi, '').trim();
    const matchedPlan = findBestMatch(target, plans);

    if (matchedPlan) {
      return {
        action: 'complete_plan',
        confidence: 0.95,
        payload: {
          planId: matchedPlan.id,
          name: matchedPlan.name,
        },
        response: `I found the plan: "${matchedPlan.name}".\nWould you like to mark it as completed?`,
        requiresConfirmation: true,
      };
    }
  }

  // Reminder completion: e.g. "complete reminder call sir", "mark reminder call supplier as done"
  const completeReminderMatch = lower.match(
    /(?:mark\s+(?:reminder\s+)?(.+?)\s+as\s+(?:done|completed?)|complete\s+(?:reminder\s+)?(.+))/i
  );
  if (completeReminderMatch) {
    const rawTarget = completeReminderMatch[1] || completeReminderMatch[2];
    const target = rawTarget.replace(/\b(reminder|the)\b/gi, '').trim();
    const matchedReminder = findBestMatch(target, reminders);

    if (matchedReminder) {
      return {
        action: 'complete_reminder',
        confidence: 0.95,
        payload: {
          reminderId: matchedReminder.id,
          title: matchedReminder.title,
        },
        response: `I found the reminder: "${matchedReminder.title}".\nWould you like to mark it as completed?`,
        requiresConfirmation: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // 5. DELETE ACTIONS (Tasks, Notes, Reminders)
  // -------------------------------------------------------------------------
  // Delete Task
  const deleteTaskMatch = lower.match(
    /(?:delete|remove)\s+(?:the\s+)?task\s+(.+)/i
  );
  if (deleteTaskMatch) {
    const target = deleteTaskMatch[1].trim();
    const matchedTask = findBestMatch(target, tasks);
    if (matchedTask) {
      return {
        action: 'delete_task',
        confidence: 0.95,
        payload: {
          taskId: matchedTask.id,
          title: matchedTask.title,
        },
        response: `I found the task: "${matchedTask.title}".\nAre you sure you want to delete it?`,
        requiresConfirmation: true,
      };
    }
  }

  // Delete Note
  const deleteNoteMatch = lower.match(
    /(?:delete|remove)\s+(?:the\s+)?note\s+(?:about\s+)?(.+)/i
  );
  if (deleteNoteMatch) {
    const target = deleteNoteMatch[1].trim();
    const matchedNote = findBestMatch(target, notes);
    if (matchedNote) {
      return {
        action: 'delete_note',
        confidence: 0.95,
        payload: {
          noteId: matchedNote.id,
          title: matchedNote.title,
        },
        response: `I found the note: "${matchedNote.title}".\nAre you sure you want to delete it?`,
        requiresConfirmation: true,
      };
    }
  }

  // Delete Reminder
  const deleteReminderMatch = lower.match(
    /(?:delete|remove)\s+(?:the\s+)?reminder\s+(?:to\s+)?(.+)/i
  );
  if (deleteReminderMatch) {
    const target = deleteReminderMatch[1].trim();
    const matchedReminder = findBestMatch(target, reminders);
    if (matchedReminder) {
      return {
        action: 'delete_reminder',
        confidence: 0.95,
        payload: {
          reminderId: matchedReminder.id,
          title: matchedReminder.title,
        },
        response: `I found the reminder: "${matchedReminder.title}".\nAre you sure you want to delete it?`,
        requiresConfirmation: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // 6. CREATE REMINDER
  // e.g. "Remind me to call sir at 5 PM", "remind me to call supplier tomorrow"
  // -------------------------------------------------------------------------
  const reminderMatch = lower.match(
    /^(?:remind\s+me\s+(?:to\s+)?|(?:create|add|set)\s+(?:a\s+)?reminder\s+(?:to\s+)?)(.+)$/i
  );

  if (reminderMatch) {
    const rawContent = reminderMatch[1];
    const { time, cleanText: textAfterTime } = extractTime(rawContent);
    const { dateCategory, dateLabel, cleanText: finalTitle } = extractDate(textAfterTime);

    const reminderTitle = capitalize(
      finalTitle
        .replace(/\b(to|for|at|by)\b$/i, '')
        .replace(/^\b(to|for)\b\s+/i, '')
        .trim()
    ) || 'Reminder';

    const reminderTime = time || '04:00 PM';

    return {
      action: 'create_reminder',
      confidence: 0.95,
      payload: {
        title: reminderTitle,
        time: reminderTime,
        dateCategory,
        dateLabel,
      },
      response: `I understood:\n• Reminder: ${reminderTitle}\n• Date: ${dateLabel}\n• Time: ${reminderTime}\n\nWould you like me to create this reminder?`,
      requiresConfirmation: true,
    };
  }

  // -------------------------------------------------------------------------
  // 7. CREATE TASK
  // e.g. "I need to study NLP tomorrow evening"
  // e.g. "Add preparing Atlas PPT to my tasks"
  // e.g. "add task study NLP tomorrow at 6 pm"
  // e.g. "I have to finish project by tonight"
  // -------------------------------------------------------------------------
  const naturalTaskPatterns = [
    /^(?:add|put)\s+(.+?)\s+to\s+(?:my\s+)?tasks$/i,
    /^(?:i\s+(?:need|have|want)\s+to)\s+(.+)$/i,
    /^(?:add|create|new|schedule)?\s*(?:a\s+)?task\s+(?:to\s+)?(.+)$/i,
  ];

  for (const pattern of naturalTaskPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const rawContent = match[1];
      const { time, cleanText: textAfterTime } = extractTime(rawContent);
      const { dateCategory, dateLabel, cleanText: finalTitle } = extractDate(textAfterTime);

      const taskTitle = capitalize(
        finalTitle
          .replace(/\b(to|for|at|by)\b$/i, '')
          .replace(/^\b(to|for)\b\s+/i, '')
          .trim()
      ) || 'New Task';

      const taskTime = time || (dateCategory === 'today' ? '05:00 PM' : '10:00 AM');

      return {
        action: 'create_task',
        confidence: 0.95,
        payload: {
          title: taskTitle,
          time: taskTime,
          dateCategory,
          dateLabel,
          priority: 'normal',
        },
        response: `I understood:\n• Task: ${taskTitle}\n• Date: ${dateLabel}\n• Time: ${taskTime}\n\nWould you like me to add it?`,
        requiresConfirmation: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // 8. CREATE NOTE
  // e.g. "create a note about internship ideas", "note down key points"
  // -------------------------------------------------------------------------
  const noteMatch = lower.match(
    /^(?:create|add|make|take|write|note\s+down)\s+(?:a\s+)?note\s+(?:about|for|titled|on)?\s*(.+)$/i
  );

  if (noteMatch) {
    const rawTopic = noteMatch[1].trim();
    const noteTitle = capitalize(rawTopic) || 'Quick Note';
    const noteContent = `Notes on ${rawTopic}`;

    return {
      action: 'create_note',
      confidence: 0.92,
      payload: {
        title: noteTitle,
        content: noteContent,
        pinned: false,
      },
      response: `I understood:\n• Title: ${noteTitle}\n• Content: ${noteContent}\n\nWould you like me to create this note?`,
      requiresConfirmation: true,
    };
  }

  // -------------------------------------------------------------------------
  // 9. CREATE PLAN
  // e.g. "make a plan for Atlas", "create plan AI Agent Learning"
  // -------------------------------------------------------------------------
  const planMatch = lower.match(
    /^(?:make|create|add|start|set\s+up)\s+(?:a\s+)?plan\s+(?:for|about|titled)?\s*(.+)$/i
  );

  if (planMatch) {
    const rawPlan = planMatch[1].trim();
    const planName = capitalize(rawPlan) || 'New Project Plan';
    const targetDate = 'Oct 30';

    return {
      action: 'create_plan',
      confidence: 0.9,
      payload: {
        name: planName,
        targetDate,
        description: `Goal for ${planName}`,
      },
      response: `I understood:\n• Plan Name: ${planName}\n• Target Date: ${targetDate}\n\nWould you like me to create this plan?`,
      requiresConfirmation: true,
    };
  }

  // -------------------------------------------------------------------------
  // 10. UNKNOWN / FALLBACK
  // -------------------------------------------------------------------------
  return {
    action: 'unknown',
    confidence: 0.2,
    payload: {},
    response:
      "I'm not sure what you want me to do yet. Try commands like:\n• \"I need to study NLP tomorrow evening\"\n• \"Remind me to call sir at 5 PM\"\n• \"What is my next class?\"\n• \"What do I have tomorrow?\"\n• \"What are my pending tasks?\"\n• \"Show my notes\"",
    requiresConfirmation: false,
  };
}
