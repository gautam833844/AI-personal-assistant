import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { AskMeCard } from '../components/AskMeCard';
import { NextEventCard } from '../components/NextEventCard';
import { TodayTasks } from '../components/TodayTasks';
import { FreeTimeCard } from '../components/FreeTimeCard';
import { UpcomingCard } from '../components/UpcomingCard';
import { Task } from '../types/task';
import {
  getNextUpcomingEvent,
  getTodayFreeTimeWindow,
  getUpcomingQuizOrExam,
} from '../services/scheduleService';
import { SPACING } from '../constants/theme';

interface HomeScreenProps {
  userName?: string;
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
  onOpenAssistant?: (initialQuery?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userName = 'Gautam',
  tasks = [],
  onToggleTask,
  onOpenAssistant,
}) => {
  const nextEvent = useMemo(() => getNextUpcomingEvent(), []);
  const freeTime = useMemo(() => getTodayFreeTimeWindow(), []);
  const upcomingQuiz = useMemo(() => getUpcomingQuizOrExam(), []);

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
        title={nextEvent ? nextEvent.title : 'No Upcoming Events'}
        time={nextEvent ? nextEvent.displayTime : 'All clear'}
        location={nextEvent ? nextEvent.location : undefined}
        badgeText={nextEvent ? nextEvent.badgeText : 'SCHEDULE'}
      />

      {/* 4. Today's Tasks */}
      <TodayTasks tasks={tasks} onToggleTask={onToggleTask} />

      {/* 5. Free Time */}
      <FreeTimeCard
        timeRange={freeTime ? freeTime.timeRange : 'Free all day'}
        subText={freeTime ? freeTime.subText : 'Available window'}
      />

      {/* 6. Upcoming */}
      <UpcomingCard
        title={upcomingQuiz ? upcomingQuiz.title : 'No upcoming quizzes'}
        timeInfo={upcomingQuiz ? upcomingQuiz.timeInfo : 'All clear for now'}
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
