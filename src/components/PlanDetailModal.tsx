import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  X,
  Calendar,
  Check,
  Edit2,
  CheckCircle2,
  Plus,
} from 'lucide-react-native';
import { Plan } from '../types/plan';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface PlanDetailModalProps {
  plan: Plan | null;
  visible: boolean;
  onClose: () => void;
  onToggleTask: (planId: string, taskId: string) => void;
  onAddTaskToPlan: (planId: string, taskTitle: string) => void;
  onToggleCompletePlan: (planId: string) => void;
  onEditPlan: (plan: Plan) => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  plan,
  visible,
  onClose,
  onToggleTask,
  onAddTaskToPlan,
  onToggleCompletePlan,
  onEditPlan,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!plan) return null;

  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((t) => t.completed).length;
  const calculatedProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isDone = plan.completed || (totalTasks > 0 && completedTasks === totalTasks);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onAddTaskToPlan(plan.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.navButton}
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <X size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.navActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.navButton}
              onPress={() => onEditPlan(plan)}
              accessibilityLabel="Edit Plan"
            >
              <Edit2 size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.completeToggleBtn, isDone && styles.completeToggleBtnActive]}
              onPress={() => onToggleCompletePlan(plan.id)}
              accessibilityLabel={isDone ? 'Mark Incomplete' : 'Mark Complete'}
            >
              <CheckCircle2
                size={16}
                color={isDone ? COLORS.textSuccess : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.completeToggleText,
                  isDone && styles.completeToggleTextActive,
                ]}
              >
                {isDone ? 'Completed' : 'Mark Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Plan Header Info */}
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, isDone && styles.planTitleDone]}>
              {plan.name}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={15} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>Target: {plan.targetDate}</Text>
              </View>
            </View>

            {plan.description ? (
              <Text style={styles.planDescription}>{plan.description}</Text>
            ) : null}
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressCardTitle}>PROGRESS</Text>
              <Text style={styles.progressPercent}>{calculatedProgress}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${calculatedProgress}%` },
                  isDone && styles.progressBarFillDone,
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              {completedTasks} of {totalTasks} tasks completed
            </Text>
          </View>

          {/* Subtasks Section */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>TASKS</Text>

            <View style={styles.taskList}>
              {plan.tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  activeOpacity={0.7}
                  style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
                  onPress={() => onToggleTask(plan.id, task.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.completed && styles.checkboxChecked,
                    ]}
                  >
                    {task.completed && (
                      <Check size={14} color="#ffffff" strokeWidth={3} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.taskText,
                      task.completed && styles.taskTextCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Add Subtask Input */}
            <View style={styles.addSubtaskRow}>
              <TextInput
                style={styles.subtaskInput}
                placeholder="Add a new task..."
                placeholderTextColor={COLORS.textTertiary}
                value={newSubtaskTitle}
                onChangeText={setNewSubtaskTitle}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.addSubtaskBtn,
                  !newSubtaskTitle.trim() && styles.addSubtaskBtnDisabled,
                ]}
                onPress={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
              >
                <Plus size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  completeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completeToggleBtnActive: {
    backgroundColor: COLORS.successSoft,
    borderColor: '#dcfce7',
  },
  completeToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  completeToggleTextActive: {
    color: COLORS.textSuccess,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
    gap: SPACING.xl,
    paddingBottom: 60,
  },
  planHeader: {
    gap: 8,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 30,
  },
  planTitleDone: {
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: 10,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textAccent,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: COLORS.cardSubtle,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.textAccent,
    borderRadius: RADIUS.full,
  },
  progressBarFillDone: {
    backgroundColor: COLORS.textSuccess,
  },
  progressSubtext: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tasksSection: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  taskList: {
    gap: 8,
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
  taskItemCompleted: {
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
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
  },
  addSubtaskBtn: {
    backgroundColor: COLORS.textAccent,
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSubtaskBtnDisabled: {
    opacity: 0.4,
  },
});
