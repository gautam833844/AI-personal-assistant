import { Task } from '../types/task';

export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete internship work',
    time: '6:00 PM',
    dateCategory: 'today',
    dateLabel: 'Today',
    priority: 'normal',
    completed: false,
  },
  {
    id: '2',
    title: 'Prepare Atlas PPT',
    time: '7:00 PM',
    dateCategory: 'today',
    dateLabel: 'Today',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    title: 'Study NLP',
    dateCategory: 'today',
    dateLabel: 'Today',
    priority: 'normal',
    completed: true,
  },
  {
    id: '4',
    title: 'Submit internship report',
    dateCategory: 'upcoming',
    dateLabel: 'Tomorrow',
    priority: 'normal',
    completed: false,
  },
];
