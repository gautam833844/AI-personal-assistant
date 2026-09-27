import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { Plan } from '../types/plan';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface PlanCardProps {
  plan: Plan;
  onPress: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onPress }) => {
  const totalTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((t) => t.completed).length;
  const calculatedProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isDone = plan.completed || (totalTasks > 0 && completedTasks === totalTasks);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.card, isDone && styles.cardCompleted]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View plan ${plan.name}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, isDone && styles.titleCompleted]}>
            {plan.name}
          </Text>
          {isDone ? (
            <View style={styles.completedBadge}>
              <CheckCircle2 size={12} color={COLORS.textSuccess} />
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          ) : null}
        </View>
        <ChevronRight size={18} color={COLORS.textTertiary} />
      </View>

      {/* Meta Row: Target Date & Task Count */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={13} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>Target: {plan.targetDate}</Text>
        </View>
        <Text style={styles.taskCountText}>
          {completedTasks}/{totalTasks} tasks
        </Text>
      </View>

      {/* Progress Bar & Percentage */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${calculatedProgress}%` },
              isDone && styles.progressBarFillCompleted,
            ]}
          />
        </View>
        <Text style={[styles.progressPercentage, isDone && styles.progressPercentageCompleted]}>
          {calculatedProgress}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardCompleted: {
    backgroundColor: '#fbfcfd',
    borderColor: '#dcfce7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  titleCompleted: {
    color: COLORS.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  completedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textSuccess,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  taskCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.cardSubtle,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.textAccent,
    borderRadius: RADIUS.full,
  },
  progressBarFillCompleted: {
    backgroundColor: COLORS.textSuccess,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textAccent,
    width: 38,
    textAlign: 'right',
  },
  progressPercentageCompleted: {
    color: COLORS.textSuccess,
  },
});
