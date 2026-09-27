import { CommandResult } from './command';

export type MessageRole = 'user' | 'assistant' | 'system';

export type AssistantActionType =
  | 'create_task'
  | 'update_task'
  | 'complete_task'
  | 'delete_task'
  | 'get_tasks'
  | 'list_tasks'
  | 'create_note'
  | 'update_note'
  | 'delete_note'
  | 'get_notes'
  | 'list_notes'
  | 'create_plan'
  | 'update_plan'
  | 'complete_plan'
  | 'get_plans'
  | 'list_plans'
  | 'create_reminder'
  | 'update_reminder'
  | 'complete_reminder'
  | 'delete_reminder'
  | 'get_reminders'
  | 'list_reminders'
  | 'get_schedule'
  | 'show_schedule'
  | 'show_next_class'
  | 'show_tomorrow'
  | 'greeting'
  | 'unknown';

export interface AssistantAction {
  type: AssistantActionType;
  payload: Record<string, unknown>;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  actionResult?: CommandResult;
  isConfirmed?: boolean;
  isCancelled?: boolean;
}
