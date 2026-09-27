import { AssistantActionType } from './assistant';
import { Task } from './task';
import { Plan } from './plan';
import { Note } from './note';
import { Reminder } from './reminder';
import { Profile } from './profile';
import { ScheduleEvent } from './schedule';

export interface CommandContext {
  userName?: string;
  assistantName?: string;
  tasks?: Task[];
  plans?: Plan[];
  notes?: Note[];
  reminders?: Reminder[];
  profile?: Profile;
  schedule?: ScheduleEvent[];
}

export interface CommandResult {
  action: AssistantActionType;
  confidence: number;
  payload: Record<string, any>;
  response: string;
  requiresConfirmation?: boolean;
}

