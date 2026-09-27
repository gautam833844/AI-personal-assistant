import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface UpcomingProps {
  title?: string;
  timeInfo?: string;
}

export const UpcomingCard: React.FC<UpcomingProps> = ({
  title = 'NLP Quiz',
  timeInfo = 'Tomorrow • 10:00 AM',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>UPCOMING</Text>
      <View style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.iconWrap}>
            <Calendar size={18} color={COLORS.textSecondary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.metaText}>{timeInfo}</Text>
          </View>
        </View>
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
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    gap: 3,
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
