export type ResponseStyle = 'Concise' | 'Balanced' | 'Detailed';
export type ThemePreference = 'Light' | 'Dark' | 'System';
export type PreferredLanguage = 'English' | 'Telugu' | 'Hindi';

export interface ProfilePreferences {
  preferredLanguage?: PreferredLanguage;
  assistantName?: string;
  theme?: ThemePreference;
  responseStyle?: ResponseStyle;
}

export interface Profile {
  id: string;
  name: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number | string;
  location?: string;
  bio?: string;
  preferences?: ProfilePreferences;
}
