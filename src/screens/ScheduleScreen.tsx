import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { DateSelector } from '../components/DateSelector';
import { TimelineEventCard } from '../components/TimelineEventCard';
import { SAMPLE_DAYS, SAMPLE_EVENTS } from '../data/sampleSchedule';
import { DayItem } from '../types/schedule';
import { getEventsForDay } from '../services/scheduleService';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export const ScheduleScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DayItem>(
    SAMPLE_DAYS.find((d) => d.isToday) || SAMPLE_DAYS[2]
  );

  const handleAddPress = () => {
    Alert.alert(
      'Add Event',
      'Event creation placeholder. Real scheduling functionality will be added in upcoming steps.'
    );
  };

  const weekdayName = selectedDay.fullDate.split(',')[0].trim();
  const displayedEvents = getEventsForDay(weekdayName, SAMPLE_EVENTS);
  const sectionTitle = selectedDay.isToday
    ? "TODAY'S SCHEDULE"
    : `${weekdayName.toUpperCase()}'S SCHEDULE`;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerDate}>{selectedDay.fullDate}</Text>
        </View>

        {/* 2. Date Selector */}
        <DateSelector
          days={SAMPLE_DAYS}
          selectedDayId={selectedDay.id}
          onSelectDay={(day) => setSelectedDay(day)}
        />

        {/* 3. Timeline Schedule Section */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          {displayedEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {`No classes or events scheduled for ${weekdayName}`}
              </Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
              {displayedEvents.map((event, index) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  isLast={index === displayedEvents.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. Add Button (Floating Action Button) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={handleAddPress}
        accessibilityRole="button"
        accessibilityLabel="Add new event"
      >
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 110, // space for bottom nav and FAB
    gap: SPACING.lg,
  },
  header: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 32,
  },
  headerDate: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  scheduleSection: {
    gap: SPACING.md,
    paddingTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  timelineList: {
    paddingTop: SPACING.xs,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 80, // positioned right above the bottom navigation bar
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
