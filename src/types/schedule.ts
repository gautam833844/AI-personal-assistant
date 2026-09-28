export type EventType = 'class' | 'quiz' | 'exam' | 'other';

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: EventType;
  day?: string;
  days?: string[];
}

export interface DayItem {
  id: string;
  dayName: string;
  dayNumber: number;
  dateString: string;
  fullDate: string;
  isToday?: boolean;
}
