import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface NextEventProps {
  title?: string;
  time?: string;
  location?: string;
  badgeText?: string;
}

export const NextEventCard: React.FC<NextEventProps> = ({
  title = 'No Upcoming Events',
  time = 'All clear',
  location,
  badgeText = 'NEXT',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{title}</Text>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Clock size={15} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        {location ? (
          <View style={styles.detailItem}>
            <MapPin size={15} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
        ) : null}
      </View>
    </View>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: COLORS.cardSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textAccent,
    letterSpacing: 0.8,
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
