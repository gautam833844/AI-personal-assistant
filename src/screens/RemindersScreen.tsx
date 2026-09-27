import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ReminderCard } from '../components/ReminderCard';
import { ReminderEditorModal } from '../components/ReminderEditorModal';
import { Reminder, ReminderDateCategory } from '../types/reminder';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface RemindersScreenProps {
  onBack: () => void;
  reminders: Reminder[];
  onSaveReminder: (
    reminderData: {
      title: string;
      dateCategory: ReminderDateCategory;
      dateLabel: string;
      time: string;
    },
    existingReminderId?: string
  ) => void;
  onDeleteReminder: (id: string) => void;
  onToggleCompleteReminder: (id: string) => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  onBack,
  reminders,
  onSaveReminder,
  onDeleteReminder,
  onToggleCompleteReminder,
}) => {
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  const todayReminders = reminders.filter(
    (r) => r.dateCategory === 'today' && !r.completed
  );
  const upcomingReminders = reminders.filter(
    (r) => r.dateCategory === 'upcoming' && !r.completed
  );
  const completedReminders = reminders.filter((r) => r.completed);

  const handleEditorSave = (data: {
    title: string;
    dateCategory: ReminderDateCategory;
    dateLabel: string;
    time: string;
  }) => {
    onSaveReminder(data, selectedReminder?.id);
    setSelectedReminder(null);
  };

  const handleEditorDelete = (id: string) => {
    onDeleteReminder(id);
    setSelectedReminder(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to More"
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSubtitle}>
            {todayReminders.length + upcomingReminders.length} active reminders
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* TODAY Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          {todayReminders.length > 0 ? (
            <View style={styles.reminderList}>
              {todayReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggleComplete={onToggleCompleteReminder}
                  onPress={() => {
                    setSelectedReminder(reminder);
                    setIsEditorOpen(true);
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No reminders for today</Text>
            </View>
          )}
        </View>

        {/* UPCOMING Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING</Text>
          {upcomingReminders.length > 0 ? (
            <View style={styles.reminderList}>
              {upcomingReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggleComplete={onToggleCompleteReminder}
                  onPress={() => {
                    setSelectedReminder(reminder);
                    setIsEditorOpen(true);
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming reminders</Text>
            </View>
          )}
        </View>

        {/* COMPLETED Section */}
        {completedReminders.length > 0 ? (
          <View style={styles.section}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.completedHeader}
              onPress={() => setIsCompletedExpanded((prev) => !prev)}
            >
              <Text style={styles.sectionTitle}>
                COMPLETED ({completedReminders.length})
              </Text>
              {isCompletedExpanded ? (
                <ChevronUp size={16} color={COLORS.textSecondary} />
              ) : (
                <ChevronDown size={16} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>

            {isCompletedExpanded && (
              <View style={styles.reminderList}>
                {completedReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggleComplete={onToggleCompleteReminder}
                    onPress={() => {
                      setSelectedReminder(reminder);
                      setIsEditorOpen(true);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => {
          setSelectedReminder(null);
          setIsEditorOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Create new reminder"
      >
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Reminder Editor Modal */}
      <ReminderEditorModal
        visible={isEditorOpen}
        initialReminder={selectedReminder}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedReminder(null);
        }}
        onSave={handleEditorSave}
        onDelete={handleEditorDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    gap: SPACING.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 110,
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  reminderList: {
    gap: SPACING.sm,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    color: COLORS.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 80,
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
