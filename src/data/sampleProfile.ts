import { Profile } from '../types/profile';

export const INITIAL_SAMPLE_PROFILE: Profile = {
  id: 'profile_default',
  name: 'Gautam Reddy',
  preferredName: 'Gautam',
  email: 'gautam@example.com',
  phone: '+91 98765 43210',
  college: 'Engineering Institute of Technology',
  degree: 'B.Tech',
  branch: 'Computer Science and Engineering',
  graduationYear: 2027,
  location: 'Hyderabad, India',
  bio: 'Computer Science student passionate about AI systems, mobile development, and building intuitive productivity tools.',
  preferences: {
    preferredLanguage: 'English',
    assistantName: 'Atlas',
    theme: 'Light',
    responseStyle: 'Balanced',
  },
};
