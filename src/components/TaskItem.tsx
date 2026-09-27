import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Clock, Calendar } from 'lucide-react-native';
import { Task, PriorityType } from '../types/task';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const getPriorityConfig = (priority: PriorityType) => {
  switch (priority) {
    case 'high':
      return {
        label: 'High',
        color: '#e11d48',
        bg: '#ffe4e6',
      };
    case 'low':
      return {
        label: 'Low',
        color: '#16a34a',
        bg: '#dcfce7',
      };
    case 'normal':
    default:
      return {
        label: 'Normal',
        color: '#2563eb',
        bg: '#eff6ff',
      };
  }
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, task.completed && styles.cardCompleted]}
      onPress={() => onToggle(task.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.completed }}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
        {task.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
      </View>

      {/* Task Content */}
      <View style={styles.contentWrap}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]}>
          {task.title}
        </Text>

        {/* Meta details (Time, Date, Priority) */}
        <View style={styles.metaRow}>
          {task.time ? (
            <View style={styles.metaItem}>
              <Clock size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{task.time}</Text>
            </View>
          ) : null}

          {task.dateLabel && task.dateCategory === 'upcoming' ? (
            <View style={styles.metaItem}>
              <Calendar size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{task.dateLabel}</Text>
            </View>
          ) : null}

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityConfig.bg },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: priorityConfig.color },
              ]}
            >
              {priorityConfig.label}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompleted: {
    backgroundColor: '#fafbfc',
    borderColor: COLORS.borderSubtle,
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
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.textAccent,
    borderColor: COLORS.textAccent,
  },
  contentWrap: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  titleCompleted: {
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  priorityText: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
