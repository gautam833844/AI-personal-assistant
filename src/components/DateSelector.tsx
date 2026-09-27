import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { DayItem } from '../types/schedule';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface DateSelectorProps {
  days: DayItem[];
  selectedDayId: string;
  onSelectDay: (day: DayItem) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  days,
  selectedDayId,
  onSelectDay,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => {
          const isSelected = day.id === selectedDayId;
          return (
            <TouchableOpacity
              key={day.id}
              activeOpacity={0.7}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
              ]}
              onPress={() => onSelectDay(day)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.dayNameText,
                  isSelected && styles.dayNameTextSelected,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumberText,
                  isSelected && styles.dayNumberTextSelected,
                ]}
              >
                {day.dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  scrollContent: {
    paddingVertical: SPACING.xs,
    gap: 10,
  },
  dayCard: {
    width: 60,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardSelected: {
    backgroundColor: COLORS.textAccent,
    borderColor: COLORS.textAccent,
    shadowColor: COLORS.textAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  dayNameTextSelected: {
    color: '#ffffff',
    opacity: 0.9,
  },
  dayNumberText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dayNumberTextSelected: {
    color: '#ffffff',
  },
});
