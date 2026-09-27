import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { AskMeCard } from '../components/AskMeCard';
import { NextEventCard } from '../components/NextEventCard';
import { TodayTasks } from '../components/TodayTasks';
import { FreeTimeCard } from '../components/FreeTimeCard';
import { UpcomingCard } from '../components/UpcomingCard';
import { SPACING } from '../constants/theme';

interface HomeScreenProps {
  userName?: string;
  onOpenAssistant?: (initialQuery?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userName = 'Gautam',
  onOpenAssistant,
}) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header */}
      <Header userName={userName} />

      {/* 2. Ask Me Section */}
      <AskMeCard onOpenAssistant={onOpenAssistant} />

      {/* 3. Next Event Card */}
      <NextEventCard
        title="Machine Learning"
        time="10:00 AM"
        location="Room 204"
      />

      {/* 4. Today's Tasks */}
      <TodayTasks />

      {/* 5. Free Time */}
      <FreeTimeCard timeRange="4:30 PM – 6:30 PM" />

      {/* 6. Upcoming */}
      <UpcomingCard
        title="NLP Quiz"
        timeInfo="Tomorrow • 10:00 AM"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 96,
    gap: SPACING.xl,
  },
});
