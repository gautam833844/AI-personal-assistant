import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { PlansScreen } from './src/screens/PlansScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { NotesScreen } from './src/screens/NotesScreen';
import { RemindersScreen } from './src/screens/RemindersScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AssistantScreen } from './src/screens/AssistantScreen';
import { BottomNavigation, type NavTab } from './src/components/BottomNavigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { Task } from './src/types/task';
import { Plan } from './src/types/plan';
import { Note } from './src/types/note';
import { Reminder, ReminderDateCategory } from './src/types/reminder';
import { Profile } from './src/types/profile';
import { INITIAL_SAMPLE_PROFILE } from './src/data/sampleProfile';
import {
  loadTasks,
  saveTasks,
  loadPlans,
  savePlans,
  loadNotes,
  saveNotes,
  loadReminders,
  saveReminders,
  loadProfile,
  saveProfile,
} from './src/services/storageService';
import { COLORS, SPACING } from './src/constants/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [moreSubScreen, setMoreSubScreen] = useState<'menu' | 'notes' | 'reminders' | 'profile'>('menu');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // App-level state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [profile, setProfile] = useState<Profile>(INITIAL_SAMPLE_PROFILE);

  // Load saved data on startup
  useEffect(() => {
    let isMounted = true;

    async function initializeAppStorage() {
      try {
        const [savedTasks, savedPlans, savedNotes, savedReminders, savedProfile] = await Promise.all([
          loadTasks(),
          loadPlans(),
          loadNotes(),
          loadReminders(),
          loadProfile(),
        ]);

        if (isMounted) {
          setTasks(savedTasks);
          setPlans(savedPlans);
          setNotes(savedNotes);
          setReminders(savedReminders);
          setProfile(savedProfile);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn('[App] Error during startup data loading:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAppStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setIsAssistantOpen(false);
    if (tab !== 'more') {
      setMoreSubScreen('menu');
    }
  };

  const handleOpenAssistant = (initialQuery?: string) => {
    setAssistantInitialQuery(initialQuery);
    setIsAssistantOpen(true);
  };

  const handleCloseAssistant = () => {
    setIsAssistantOpen(false);
    setAssistantInitialQuery(undefined);
  };

  // --- Tasks Handlers ---
  const handleToggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      saveTasks(updated);
      return updated;
    });
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      saveTasks(updated);
      return updated;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTasks(updated);
      return updated;
    });
  };

  // --- Plans Handlers ---
  const handleTogglePlanTask = (planId: string, taskId: string) => {
    setPlans((prevPlans) => {
      const updated = prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        const updatedTasks = plan.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        return {
          ...plan,
          tasks: updatedTasks,
        };
      });
      savePlans(updated);
      return updated;
    });
  };

  const handleAddTaskToPlan = (planId: string, taskTitle: string) => {
    setPlans((prevPlans) => {
      const updated = prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        const newTask = {
          id: `task_${Date.now()}`,
          title: taskTitle,
          completed: false,
        };
        return {
          ...plan,
          tasks: [...plan.tasks, newTask],
        };
      });
      savePlans(updated);
      return updated;
    });
  };

  const handleToggleCompletePlan = (planId: string) => {
    setPlans((prevPlans) => {
      const updated = prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          completed: !plan.completed,
        };
      });
      savePlans(updated);
      return updated;
    });
  };

  const handleSavePlan = (
    planData: {
      name: string;
      targetDate: string;
      description?: string;
    },
    editingPlanId?: string
  ) => {
    setPlans((prevPlans) => {
      let updated: Plan[];
      if (editingPlanId) {
        updated = prevPlans.map((p) =>
          p.id === editingPlanId
            ? {
                ...p,
                name: planData.name,
                targetDate: planData.targetDate,
                description: planData.description,
              }
            : p
        );
      } else {
        const newPlan: Plan = {
          id: `plan_${Date.now()}`,
          name: planData.name,
          targetDate: planData.targetDate,
          description: planData.description,
          completed: false,
          tasks: [],
        };
        updated = [newPlan, ...prevPlans];
      }
      savePlans(updated);
      return updated;
    });
  };

  // --- Notes Handlers ---
  const handleSaveNote = (
    noteData: { title: string; content: string; pinned: boolean },
    existingNoteId?: string
  ) => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    setNotes((prev) => {
      let updated: Note[];
      if (existingNoteId) {
        updated = prev.map((n) =>
          n.id === existingNoteId
            ? {
                ...n,
                title: noteData.title,
                content: noteData.content,
                pinned: noteData.pinned,
                updatedAt: today,
              }
            : n
        );
      } else {
        const newNote: Note = {
          id: `note_${Date.now()}`,
          title: noteData.title,
          content: noteData.content,
          pinned: noteData.pinned,
          createdAt: today,
          updatedAt: today,
        };
        updated = [newNote, ...prev];
      }
      saveNotes(updated);
      return updated;
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotes(updated);
      return updated;
    });
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      );
      saveNotes(updated);
      return updated;
    });
  };

  // --- Reminders Handlers ---
  const handleSaveReminder = (
    data: {
      title: string;
      dateCategory: ReminderDateCategory;
      dateLabel: string;
      time: string;
    },
    existingReminderId?: string
  ) => {
    setReminders((prev) => {
      let updated: Reminder[];
      if (existingReminderId) {
        updated = prev.map((r) =>
          r.id === existingReminderId
            ? {
                ...r,
                title: data.title,
                dateCategory: data.dateCategory,
                dateLabel: data.dateLabel,
                time: data.time,
              }
            : r
        );
      } else {
        const newReminder: Reminder = {
          id: `rem_${Date.now()}`,
          title: data.title,
          dateCategory: data.dateCategory,
          dateLabel: data.dateLabel,
          time: data.time,
          completed: false,
          createdAt: 'Today',
        };
        updated = [newReminder, ...prev];
      }
      saveReminders(updated);
      return updated;
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveReminders(updated);
      return updated;
    });
  };

  const handleToggleCompleteReminder = (id: string) => {
    setReminders((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              completed: !r.completed,
            }
          : r
      );
      saveReminders(updated);
      return updated;
    });
  };

  // --- Profile Handler ---
  const handleSaveProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const renderCurrentScreen = () => {
    if (isAssistantOpen) {
      return (
        <AssistantScreen
          onBack={handleCloseAssistant}
          initialQuery={assistantInitialQuery}
          tasks={tasks}
          plans={plans}
          notes={notes}
          reminders={reminders}
          profile={profile}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onSavePlan={handleSavePlan}
          onToggleCompletePlan={handleToggleCompletePlan}
          onSaveReminder={handleSaveReminder}
          onToggleCompleteReminder={handleToggleCompleteReminder}
          onDeleteReminder={handleDeleteReminder}
        />
      );
    }

    switch (activeTab) {
      case 'schedule':
        return <ScheduleScreen />;
      case 'tasks':
        return (
          <TasksScreen
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        );
      case 'plans':
        return (
          <PlansScreen
            plans={plans}
            onTogglePlanTask={handleTogglePlanTask}
            onAddTaskToPlan={handleAddTaskToPlan}
            onToggleCompletePlan={handleToggleCompletePlan}
            onSavePlan={handleSavePlan}
          />
        );
      case 'more':
        if (moreSubScreen === 'notes') {
          return (
            <NotesScreen
              onBack={() => setMoreSubScreen('menu')}
              notes={notes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePin}
            />
          );
        }
        if (moreSubScreen === 'reminders') {
          return (
            <RemindersScreen
              onBack={() => setMoreSubScreen('menu')}
              reminders={reminders}
              onSaveReminder={handleSaveReminder}
              onDeleteReminder={handleDeleteReminder}
              onToggleCompleteReminder={handleToggleCompleteReminder}
            />
          );
        }
        if (moreSubScreen === 'profile') {
          return (
            <ProfileScreen
              profile={profile}
              onBack={() => setMoreSubScreen('menu')}
              onSaveProfile={handleSaveProfile}
            />
          );
        }
        return (
          <MoreScreen
            onNavigateToNotes={() => setMoreSubScreen('notes')}
            onNavigateToReminders={() => setMoreSubScreen('reminders')}
            onNavigateToProfile={() => setMoreSubScreen('profile')}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            userName={profile.preferredName || profile.name || 'Gautam'}
            onOpenAssistant={handleOpenAssistant}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar style="dark" />
          <ActivityIndicator size="large" color={COLORS.textAccent} />
          <Text style={styles.loadingText}>Loading Personal Assistant...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <StatusBar style="dark" />
          <View style={styles.container}>
            {/* Main Screen Content */}
            <View style={styles.screenContainer}>
              {renderCurrentScreen()}
            </View>

            {/* Fixed Bottom Navigation */}
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
