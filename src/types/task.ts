export type PriorityType = 'low' | 'normal' | 'high';

export type TaskDateCategory = 'today' | 'upcoming';

export interface Task {
  id: string;
  title: string;
  dateCategory: TaskDateCategory;
  dateLabel?: string;
  time?: string;
  priority: PriorityType;
  completed: boolean;
}
