import { CommandResult } from '../types/command';
import { parseCommand } from './commandParser';
import { Task } from '../types/task';
import { Plan } from '../types/plan';
import { Note } from '../types/note';
import { Reminder } from '../types/reminder';

interface AssistantContext {
  userName?: string;
  assistantName?: string;
  tasks?: Task[];
  plans?: Plan[];
  notes?: Note[];
  reminders?: Reminder[];
}

/**
 * High-level assistant service orchestrator.
 * Parses user command with rich context and returns structured CommandResult without directly mutating state.
 */
export function processCommand(input: string, context?: AssistantContext): CommandResult {
  return parseCommand(input, {
    userName: context?.userName || 'Gautam',
    assistantName: context?.assistantName || 'Atlas',
    tasks: context?.tasks,
    plans: context?.plans,
    notes: context?.notes,
    reminders: context?.reminders,
  });
}
