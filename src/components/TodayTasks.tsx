import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Complete internship work', completed: false },
  { id: '2', text: 'Prepare Atlas PPT', completed: false },
  { id: '3', text: 'Study for NLP quiz', completed: false },
];

export const TodayTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>TODAY'S TASKS</Text>
      <View style={styles.tasksList}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            activeOpacity={0.7}
            style={styles.taskItem}
            onPress={() => toggleTask(task.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
          >
            <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
              {task.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
              {task.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
});
