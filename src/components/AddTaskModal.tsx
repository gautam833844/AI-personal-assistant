import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PriorityType, TaskDateCategory, Task } from '../types/task';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [dateCategory, setDateCategory] = useState<TaskDateCategory>('today');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<PriorityType>('normal');

  const handleSave = () => {
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      dateCategory,
      dateLabel: dateCategory === 'today' ? 'Today' : 'Tomorrow',
      time: time.trim() ? time.trim() : undefined,
      priority,
    });

    // Reset fields
    setTitle('');
    setDateCategory('today');
    setTime('');
    setPriority('normal');
    onClose();
  };

  const handleCancel = () => {
    setTitle('');
    setTime('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>New Task</Text>

                {/* Task Title Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>TASK NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Prepare Presentation"
                    placeholderTextColor={COLORS.textTertiary}
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                  />
                </View>

                {/* Date Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>DATE</Text>
                  <View style={styles.segmentedRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.segmentButton,
                        dateCategory === 'today' && styles.segmentButtonActive,
                      ]}
                      onPress={() => setDateCategory('today')}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          dateCategory === 'today' && styles.segmentTextActive,
                        ]}
                      >
                        Today
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.segmentButton,
                        dateCategory === 'upcoming' && styles.segmentButtonActive,
                      ]}
                      onPress={() => setDateCategory('upcoming')}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          dateCategory === 'upcoming' && styles.segmentTextActive,
                        ]}
                      >
                        Tomorrow
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Optional Time Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>TIME (OPTIONAL)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 6:00 PM"
                    placeholderTextColor={COLORS.textTertiary}
                    value={time}
                    onChangeText={setTime}
                  />
                </View>

                {/* Priority Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>PRIORITY</Text>
                  <View style={styles.segmentedRow}>
                    {(['low', 'normal', 'high'] as PriorityType[]).map((p) => {
                      const isSelected = priority === p;
                      return (
                        <TouchableOpacity
                          key={p}
                          activeOpacity={0.7}
                          style={[
                            styles.segmentButton,
                            isSelected && styles.segmentButtonActive,
                          ]}
                          onPress={() => setPriority(p)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              isSelected && styles.segmentTextActive,
                            ]}
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.submitButton,
                      !title.trim() && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!title.trim()}
                  >
                    <Text style={styles.submitButtonText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.lg,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    backgroundColor: '#fafbfc',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.textAccent,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.textAccent,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    paddingTop: SPACING.xs,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    backgroundColor: COLORS.textAccent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
