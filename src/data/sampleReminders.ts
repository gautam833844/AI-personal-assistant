import { Reminder } from '../types/reminder';

export const INITIAL_SAMPLE_REMINDERS: Reminder[] = [
  {
    id: '1',
    title: 'Call supplier',
    dateCategory: 'today',
    dateLabel: 'Today',
    time: '4:00 PM',
    completed: false,
    createdAt: 'Today',
  },
  {
    id: '2',
    title: 'Study NLP',
    dateCategory: 'today',
    dateLabel: 'Today',
    time: '7:00 PM',
    completed: false,
    createdAt: 'Today',
  },
  {
    id: '3',
    title: 'Submit internship report',
    dateCategory: 'upcoming',
    dateLabel: 'Tomorrow',
    time: '10:00 AM',
    completed: false,
    createdAt: 'Today',
  },
];
