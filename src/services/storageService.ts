import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import { Plan } from '../types/plan';
import { Note } from '../types/note';
import { Reminder } from '../types/reminder';
import { Profile } from '../types/profile';
import { INITIAL_SAMPLE_TASKS } from '../data/sampleTasks';
import { INITIAL_SAMPLE_PLANS } from '../data/samplePlans';
import { INITIAL_SAMPLE_NOTES } from '../data/sampleNotes';
import { INITIAL_SAMPLE_REMINDERS } from '../data/sampleReminders';
import { INITIAL_SAMPLE_PROFILE } from '../data/sampleProfile';

export const STORAGE_KEYS = {
  TASKS: '@per_ai_tasks',
  PLANS: '@per_ai_plans',
  NOTES: '@per_ai_notes',
  REMINDERS: '@per_ai_reminders',
  PROFILE: '@per_ai_profile',
} as const;

/**
 * Generic loadData function with try/catch and fallback
 */
export async function loadData<T>(key: string, fallbackData: T): Promise<T> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue) as T;
    }
    return fallbackData;
  } catch (error) {
    console.warn(`[storageService] Error loading data for key "${key}":`, error);
    return fallbackData;
  }
}

/**
 * Generic saveData function with try/catch
 */
export async function saveData<T>(key: string, data: T): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.warn(`[storageService] Error saving data for key "${key}":`, error);
    return false;
  }
}

/**
 * Generic removeData function with try/catch
 */
export async function removeData(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storageService] Error removing data for key "${key}":`, error);
    return false;
  }
}

// --- Domain-Specific Helpers ---

export async function loadTasks(): Promise<Task[]> {
  return loadData<Task[]>(STORAGE_KEYS.TASKS, INITIAL_SAMPLE_TASKS);
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  return saveData<Task[]>(STORAGE_KEYS.TASKS, tasks);
}

export async function loadPlans(): Promise<Plan[]> {
  return loadData<Plan[]>(STORAGE_KEYS.PLANS, INITIAL_SAMPLE_PLANS);
}

export async function savePlans(plans: Plan[]): Promise<boolean> {
  return saveData<Plan[]>(STORAGE_KEYS.PLANS, plans);
}

export async function loadNotes(): Promise<Note[]> {
  return loadData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_SAMPLE_NOTES);
}

export async function saveNotes(notes: Note[]): Promise<boolean> {
  return saveData<Note[]>(STORAGE_KEYS.NOTES, notes);
}

export async function loadReminders(): Promise<Reminder[]> {
  return loadData<Reminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_SAMPLE_REMINDERS);
}

export async function saveReminders(reminders: Reminder[]): Promise<boolean> {
  return saveData<Reminder[]>(STORAGE_KEYS.REMINDERS, reminders);
}

export async function loadProfile(): Promise<Profile> {
  return loadData<Profile>(STORAGE_KEYS.PROFILE, INITIAL_SAMPLE_PROFILE);
}

export async function saveProfile(profile: Profile): Promise<boolean> {
  return saveData<Profile>(STORAGE_KEYS.PROFILE, profile);
}
