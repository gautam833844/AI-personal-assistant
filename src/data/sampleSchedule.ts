import { ScheduleEvent, DayItem } from '../types/schedule';

// ============================================================================
// Demo / Sample Schedule Dataset for College Timetable Testing
// NOTE: These events represent sample demonstration data for UI previews and
// testing, not an authoritative real-world college timetable.
// ============================================================================

export const SAMPLE_DAYS: DayItem[] = [
  { id: '1', dayName: 'Mon', dayNumber: 21, dateString: 'Sep 21', fullDate: 'Monday, Sep 21' },
  { id: '2', dayName: 'Tue', dayNumber: 22, dateString: 'Sep 22', fullDate: 'Tuesday, Sep 22' },
  { id: '3', dayName: 'Wed', dayNumber: 23, dateString: 'Sep 23', fullDate: 'Wednesday, Sep 23', isToday: true },
  { id: '4', dayName: 'Thu', dayNumber: 24, dateString: 'Sep 24', fullDate: 'Thursday, Sep 24' },
  { id: '5', dayName: 'Fri', dayNumber: 25, dateString: 'Sep 25', fullDate: 'Friday, Sep 25' },
];

export const SAMPLE_EVENTS: ScheduleEvent[] = [
  {
    id: '1',
    time: '09:00 AM',
    endTime: '10:00 AM',
    durationMinutes: 60,
    title: 'Machine Learning',
    location: 'Room 204',
    type: 'class',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    day: 'Monday',
  },
  {
    id: '2',
    time: '11:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 60,
    title: 'Natural Language Processing',
    location: 'Room 301',
    type: 'class',
    days: ['Monday', 'Wednesday', 'Friday'],
    day: 'Monday',
  },
  {
    id: '3',
    time: '02:00 PM',
    endTime: '03:00 PM',
    durationMinutes: 60,
    title: 'Database Systems',
    location: 'Room 105',
    type: 'class',
    days: ['Monday', 'Tuesday', 'Thursday'],
    day: 'Monday',
  },
  {
    id: '4',
    time: '04:00 PM',
    endTime: '05:00 PM',
    durationMinutes: 60,
    title: 'NLP Quiz',
    location: 'Room 204',
    type: 'quiz',
    days: ['Wednesday'],
    day: 'Wednesday',
  },
];
