import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  CalendarDays,
  CheckSquare,
  Compass,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

export type NavTab = 'home' | 'schedule' | 'tasks' | 'plans' | 'more';

interface BottomNavigationProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab: controlledTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const [internalTab, setInternalTab] = useState<NavTab>('home');
  const activeTab = controlledTab ?? internalTab;

  const handleTabClick = (tab: NavTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const navItems: {
    id: NavTab;
    label: string;
    IconComponent: LucideIcon;
  }[] = [
    { id: 'home', label: 'Home', IconComponent: Home },
    { id: 'schedule', label: 'Schedule', IconComponent: CalendarDays },
    { id: 'tasks', label: 'Tasks', IconComponent: CheckSquare },
    { id: 'plans', label: 'Plans', IconComponent: Compass },
    { id: 'more', label: 'More', IconComponent: MoreHorizontal },
  ];

  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.IconComponent;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={styles.navItem}
            onPress={() => handleTabClick(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon
              size={20}
              color={isActive ? COLORS.textAccent : COLORS.textTertiary}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: SPACING.sm + 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  navLabelActive: {
    color: COLORS.textAccent,
  },
});
