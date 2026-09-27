export type ReminderDateCategory = 'today' | 'upcoming';

export interface Reminder {
  id: string;
  title: string;
  dateCategory: ReminderDateCategory;
  dateLabel: string;
  time: string;
  completed: boolean;
  createdAt: string;
}
