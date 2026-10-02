import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface FreeTimeProps {
  timeRange?: string;
  subText?: string;
}

export const FreeTimeCard: React.FC<FreeTimeProps> = ({
  timeRange = 'Free all day',
  subText = 'Available window',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>FREE TIME</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <View style={styles.iconWrap}>
            <Sparkles size={18} color={COLORS.textSuccess} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.timeRangeText}>{timeRange}</Text>
            <Text style={styles.subText}>{subText}</Text>
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
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    gap: 2,
  },
  timeRangeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  subText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSuccess,
  },
});
