import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { ScheduleEvent, EventType } from '../types/schedule';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface TimelineEventCardProps {
  event: ScheduleEvent;
  isLast?: boolean;
}

const getBadgeConfig = (type: EventType) => {
  switch (type) {
    case 'quiz':
      return {
        label: 'Quiz',
        bg: '#fffbeb',
        border: '#fef3c7',
        text: '#d97706',
        dotColor: '#d97706',
      };
    case 'exam':
      return {
        label: 'Exam',
        bg: '#faf5ff',
        border: '#f3e8ff',
        text: '#9333ea',
        dotColor: '#9333ea',
      };
    case 'other':
      return {
        label: 'Other',
        bg: '#f1f5f9',
        border: '#e2e8f0',
        text: '#64748b',
        dotColor: '#64748b',
      };
    case 'class':
    default:
      return {
        label: 'Class',
        bg: '#eff6ff',
        border: '#dbeafe',
        text: '#2563eb',
        dotColor: '#2563eb',
      };
  }
};

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  isLast = false,
}) => {
  const badge = getBadgeConfig(event.type);

  return (
    <View style={styles.timelineRow}>
      {/* Left Timeline Indicator */}
      <View style={styles.indicatorCol}>
        <View style={[styles.timelineDot, { borderColor: badge.dotColor }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Right Content Card */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.timeRow}>
              <Clock size={13} color={COLORS.textSecondary} />
              <Text style={styles.timeText}>{event.time}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: badge.bg, borderColor: badge.border },
              ]}
            >
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          <Text style={styles.titleText}>{event.title}</Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{event.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.md,
  },
  indicatorCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 6,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 2.5,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  cardWrapper: {
    flex: 1,
    paddingBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: 8,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 2,
  },
  locationText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
