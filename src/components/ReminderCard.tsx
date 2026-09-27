import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Clock, Calendar } from 'lucide-react-native';
import { Reminder } from '../types/reminder';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: (id: string) => void;
  onPress: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggleComplete,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.card, reminder.completed && styles.cardCompleted]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Reminder: ${reminder.title}`}
    >
      {/* Checkbox */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.checkbox,
          reminder.completed && styles.checkboxChecked,
        ]}
        onPress={() => onToggleComplete(reminder.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: reminder.completed }}
      >
        {reminder.completed && (
          <Check size={14} color="#ffffff" strokeWidth={3} />
        )}
      </TouchableOpacity>

      {/* Reminder Content */}
      <View style={styles.contentWrap}>
        <Text
          style={[styles.title, reminder.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {reminder.title}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{reminder.dateLabel}</Text>
          </View>

          <Text style={styles.metaDot}>•</Text>

          <View style={styles.metaItem}>
            <Clock size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{reminder.time}</Text>
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
    gap: 6,
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
  metaDot: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
