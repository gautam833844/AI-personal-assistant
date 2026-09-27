import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  FileText,
  Bell,
  Brain,
  Settings,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface MoreScreenProps {
  onNavigateToNotes: () => void;
  onNavigateToReminders: () => void;
  onNavigateToProfile: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  onNavigateToNotes,
  onNavigateToReminders,
  onNavigateToProfile,
}) => {
  const handlePlaceholderPress = (title: string) => {
    Alert.alert(
      title,
      `${title} will be configured in future steps.`,
      [{ text: 'OK' }]
    );
  };

  const menuOptions = [
    {
      id: 'notes',
      title: 'Notes',
      subtitle: 'Personal notes, thoughts & quick ideas',
      icon: FileText,
      iconColor: COLORS.textAccent,
      iconBg: COLORS.accentSoft,
      onPress: onNavigateToNotes,
    },
    {
      id: 'reminders',
      title: 'Reminders',
      subtitle: 'Scheduled alerts & to-dos',
      icon: Bell,
      iconColor: '#ea580c',
      iconBg: '#fff7ed',
      onPress: onNavigateToReminders,
    },
    {
      id: 'memory',
      title: 'My Information',
      subtitle: 'Personal memory, preferences & facts',
      icon: Brain,
      iconColor: '#9333ea',
      iconBg: '#faf5ff',
      onPress: onNavigateToProfile,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences & configurations',
      icon: Settings,
      iconColor: COLORS.textSecondary,
      iconBg: COLORS.cardSubtle,
      onPress: () => handlePlaceholderPress('Settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
          <Text style={styles.headerSubtitle}>Personal tools & settings</Text>
        </View>

        {/* Menu Options List */}
        <View style={styles.menuList}>
          {menuOptions.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={styles.menuCard}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View
                  style={[styles.iconWrap, { backgroundColor: item.iconBg }]}
                >
                  <Icon size={20} color={item.iconColor} />
                </View>

                <View style={styles.textWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <ChevronRight size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 110,
    gap: SPACING.xl,
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
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  menuList: {
    gap: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
