import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native';
import { TaskItem } from '../components/TaskItem';
import { AddTaskModal } from '../components/AddTaskModal';
import { Task } from '../types/task';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface TasksScreenProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (newTaskData: Omit<Task, 'id' | 'completed'>) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Filter tasks into sections
  const todayPendingTasks = tasks.filter(
    (t) => t.dateCategory === 'today' && !t.completed
  );
  const upcomingPendingTasks = tasks.filter(
    (t) => t.dateCategory === 'upcoming' && !t.completed
  );
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {todayPendingTasks.length + upcomingPendingTasks.length} pending tasks
          </Text>
        </View>

        {/* 2. Today Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          {todayPendingTasks.length > 0 ? (
            <View style={styles.taskList}>
              {todayPendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending tasks for today</Text>
            </View>
          )}
        </View>

        {/* 3. Upcoming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING</Text>
          {upcomingPendingTasks.length > 0 ? (
            <View style={styles.taskList}>
              {upcomingPendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming tasks</Text>
            </View>
          )}
        </View>

        {/* 4. Completed Section */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.completedHeader}
              onPress={() => setIsCompletedExpanded((prev) => !prev)}
            >
              <Text style={styles.sectionTitle}>
                COMPLETED ({completedTasks.length})
              </Text>
              {isCompletedExpanded ? (
                <ChevronUp size={16} color={COLORS.textSecondary} />
              ) : (
                <ChevronDown size={16} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>

            {isCompletedExpanded && (
              <View style={styles.taskList}>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 6. Floating Action Button (+) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => setIsAddModalOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Add new task"
      >
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={onAddTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  header: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
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
  taskList: {
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
