import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Task } from '../types/task';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface TodayTasksProps {
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks = [],
  onToggleTask,
}) => {
  const todayTasks = tasks.filter((t) => t.dateCategory === 'today');

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>TODAY'S TASKS</Text>
      {todayTasks.length > 0 ? (
        <View style={styles.tasksList}>
          {todayTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              activeOpacity={0.7}
              style={styles.taskItem}
              onPress={() => onToggleTask?.(task.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.completed }}
            >
              <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                {task.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
              </View>
              <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                {task.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tasks for today</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  tasksList: {
    gap: SPACING.sm,
  },
  taskItem: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.checkboxBorder,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.textAccent,
    borderColor: COLORS.textAccent,
  },
  taskText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  taskTextCompleted: {
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
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
});
