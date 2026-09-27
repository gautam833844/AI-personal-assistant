import { Note } from '../types/note';

export const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: '1',
    title: 'Internship',
    content: 'Prepare Aurelle tasks before Friday.',
    createdAt: 'Sep 22',
    updatedAt: 'Sep 22',
    pinned: true,
  },
  {
    id: '2',
    title: 'AI Assistant Ideas',
    content: 'Personal assistant, reminders, laptop access, scheduled messages.',
    createdAt: 'Sep 21',
    updatedAt: 'Sep 21',
    pinned: false,
  },
  {
    id: '3',
    title: 'College',
    content: 'Prepare NLP quiz topics.',
    createdAt: 'Sep 20',
    updatedAt: 'Sep 20',
    pinned: false,
  },
];
