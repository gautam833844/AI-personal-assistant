import React, { useState, useEffect } from 'react';
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
import { Plan } from '../types/plan';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface PlanFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (planData: { name: string; targetDate: string; description?: string }) => void;
  initialPlan?: Plan | null;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialPlan,
}) => {
  const [name, setName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialPlan) {
      setName(initialPlan.name);
      setTargetDate(initialPlan.targetDate);
      setDescription(initialPlan.description || '');
    } else {
      setName('');
      setTargetDate('');
      setDescription('');
    }
  }, [initialPlan, visible]);

  const handleSubmit = () => {
    if (!name.trim() || !targetDate.trim()) return;

    onSubmit({
      name: name.trim(),
      targetDate: targetDate.trim(),
      description: description.trim() ? description.trim() : undefined,
    });

    onClose();
  };

  const isEditing = Boolean(initialPlan);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Plan' : 'New Plan'}
                </Text>

                {/* Plan Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>PLAN NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Atlas Project"
                    placeholderTextColor={COLORS.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoFocus={!isEditing}
                  />
                </View>

                {/* Target Date */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>TARGET DATE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Sep 30"
                    placeholderTextColor={COLORS.textTertiary}
                    value={targetDate}
                    onChangeText={setTargetDate}
                  />
                </View>

                {/* Optional Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Brief description or milestones..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.submitButton,
                      (!name.trim() || !targetDate.trim()) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!name.trim() || !targetDate.trim()}
                  >
                    <Text style={styles.submitButtonText}>
                      {isEditing ? 'Save Changes' : 'Create Plan'}
                    </Text>
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
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
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
