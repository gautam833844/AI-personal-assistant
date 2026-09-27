import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Trash2, X, Calendar } from 'lucide-react-native';
import { Reminder, ReminderDateCategory } from '../types/reminder';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ReminderEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reminderData: {
    title: string;
    dateCategory: ReminderDateCategory;
    dateLabel: string;
    time: string;
  }) => void;
  onDelete?: (id: string) => void;
  initialReminder?: Reminder | null;
}

export const ReminderEditorModal: React.FC<ReminderEditorModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialReminder,
}) => {
  const [title, setTitle] = useState('');
  const [dateCategory, setDateCategory] = useState<ReminderDateCategory>('today');
  const [timeText, setTimeText] = useState('4:00 PM');

  // Time preset options for quick mobile selection
  const timePresets = ['09:00 AM', '12:00 PM', '04:00 PM', '07:00 PM', '09:00 PM'];

  useEffect(() => {
    if (initialReminder) {
      setTitle(initialReminder.title);
      setDateCategory(initialReminder.dateCategory);
      setTimeText(initialReminder.time);
    } else {
      setTitle('');
      setDateCategory('today');
      // Default to 1 hour from now formatted
      const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
      const formattedDefault = defaultTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setTimeText(formattedDefault);
    }
  }, [initialReminder, visible]);

  const isEditing = Boolean(initialReminder);

  const handleSave = () => {
    if (!title.trim()) return;

    const dateLabel = dateCategory === 'today' ? 'Today' : 'Tomorrow';

    onSave({
      title: title.trim(),
      dateCategory,
      dateLabel,
      time: timeText.trim() || '12:00 PM',
    });

    onClose();
  };

  const handleDelete = () => {
    if (!initialReminder || !onDelete) return;

    Alert.alert(
      'Delete this reminder?',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(initialReminder.id);
            onClose();
          },
        },
      ]
    );
  };

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
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isEditing ? 'Edit Reminder' : 'New Reminder'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.closeBtn}
                    onPress={onClose}
                  >
                    <X size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formScroll}
                  contentContainerStyle={styles.formContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Title Field */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>REMINDER TITLE</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Call supplier"
                      placeholderTextColor={COLORS.textTertiary}
                      value={title}
                      onChangeText={setTitle}
                      autoFocus={!isEditing}
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
                        <Calendar
                          size={14}
                          color={dateCategory === 'today' ? COLORS.textAccent : COLORS.textSecondary}
                        />
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
                        <Calendar
                          size={14}
                          color={dateCategory === 'upcoming' ? COLORS.textAccent : COLORS.textSecondary}
                        />
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

                  {/* Time Input & Presets */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>TIME</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., 4:00 PM"
                      placeholderTextColor={COLORS.textTertiary}
                      value={timeText}
                      onChangeText={setTimeText}
                    />
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.presetScroll}
                    >
                      {timePresets.map((preset) => (
                        <TouchableOpacity
                          key={preset}
                          activeOpacity={0.7}
                          style={[
                            styles.presetChip,
                            timeText === preset && styles.presetChipActive,
                          ]}
                          onPress={() => setTimeText(preset)}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              timeText === preset && styles.presetChipTextActive,
                            ]}
                          >
                            {preset}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </ScrollView>

                {/* Actions */}
                <View style={styles.actionRow}>
                  {isEditing && onDelete ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.deleteBtn}
                      onPress={handleDelete}
                      accessibilityLabel="Delete reminder"
                    >
                      <Trash2 size={18} color="#e11d48" />
                    </TouchableOpacity>
                  ) : null}

                  <View style={styles.actionRight}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.cancelBtn}
                      onPress={onClose}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        styles.saveBtn,
                        !title.trim() && styles.saveBtnDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={!title.trim()}
                    >
                      <Text style={styles.saveBtnText}>
                        {isEditing ? 'Save' : 'Save Reminder'}
                      </Text>
                    </TouchableOpacity>
                  </View>
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
    padding: SPACING.lg,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 420,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    maxHeight: '90%',
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formScroll: {
    maxHeight: 380,
  },
  formContent: {
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardSubtle,
    borderWidth: 1,
    borderColor: 'transparent',
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
  presetScroll: {
    gap: 6,
    paddingTop: 4,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.textAccent,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetChipTextActive: {
    color: COLORS.textAccent,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: '#ffe4e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginLeft: 'auto',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    backgroundColor: COLORS.textAccent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.md,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
