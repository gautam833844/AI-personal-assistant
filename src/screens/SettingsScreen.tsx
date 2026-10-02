import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Sparkles,
  Globe,
  MessageSquare,
  Info,
} from 'lucide-react-native';
import {
  Profile,
  ProfilePreferences,
  PreferredLanguage,
  ResponseStyle,
} from '../types/profile';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import appConfig from '../../app.json';

interface SettingsScreenProps {
  profile: Profile;
  onBack: () => void;
  onSaveProfile: (updatedProfile: Profile) => void;
}

const LANGUAGES: PreferredLanguage[] = ['English', 'Telugu', 'Hindi'];
const RESPONSE_STYLES: ResponseStyle[] = ['Concise', 'Balanced', 'Detailed'];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onBack,
  onSaveProfile,
}) => {
  const currentPreferences = profile.preferences || {};
  const [assistantName, setAssistantName] = useState(
    currentPreferences.assistantName || 'Atlas'
  );

  useEffect(() => {
    setAssistantName(profile.preferences?.assistantName || 'Atlas');
  }, [profile.preferences?.assistantName]);

  const handleUpdatePreference = <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K]
  ) => {
    const updatedPreferences: ProfilePreferences = {
      ...profile.preferences,
      [key]: value,
    };
    const updatedProfile: Profile = {
      ...profile,
      preferences: updatedPreferences,
    };
    onSaveProfile(updatedProfile);
  };

  const handleAssistantNameBlur = () => {
    const trimmed = assistantName.trim();
    const effectiveName = trimmed || 'Atlas';
    if (effectiveName !== (profile.preferences?.assistantName || 'Atlas')) {
      handleUpdatePreference('assistantName', effectiveName);
    }
  };

  const activeLanguage = currentPreferences.preferredLanguage || 'English';
  const activeResponseStyle = currentPreferences.responseStyle || 'Balanced';
  const appName = appConfig?.expo?.name || 'Personal Assistant';
  const appVersion = appConfig?.expo?.version || '1.0.0';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to More"
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>App & assistant preferences</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================================= */}
        {/* 1. ASSISTANT PREFERENCES                                                 */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>ASSISTANT PREFERENCES</Text>
          <View style={styles.card}>
            {/* Assistant Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Sparkles size={15} color={COLORS.textAccent} />
                <Text style={styles.fieldLabel}>ASSISTANT NAME</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={assistantName}
                onChangeText={setAssistantName}
                onBlur={handleAssistantNameBlur}
                placeholder="e.g. Atlas"
                placeholderTextColor={COLORS.textTertiary}
                returnKeyType="done"
              />
              <Text style={styles.helperText}>
                The AI assistant will refer to itself by this name.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Preferred Language */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Globe size={15} color={COLORS.textAccent} />
                <Text style={styles.fieldLabel}>PREFERRED LANGUAGE</Text>
              </View>
              <View style={styles.chipsRow}>
                {LANGUAGES.map((lang) => {
                  const isActive = activeLanguage === lang;
                  return (
                    <TouchableOpacity
                      key={lang}
                      activeOpacity={0.7}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => handleUpdatePreference('preferredLanguage', lang)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${lang}`}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                Primary language used for assistant conversations.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Response Style */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MessageSquare size={15} color={COLORS.textAccent} />
                <Text style={styles.fieldLabel}>RESPONSE STYLE</Text>
              </View>
              <View style={styles.chipsRow}>
                {RESPONSE_STYLES.map((style) => {
                  const isActive = activeResponseStyle === style;
                  return (
                    <TouchableOpacity
                      key={style}
                      activeOpacity={0.7}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => handleUpdatePreference('responseStyle', style)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${style} response style`}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {style}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>
                Controls verbosity and detail of AI answers.
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 2. ABOUT                                                                 */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>ABOUT</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <View style={styles.aboutIconBox}>
                <Info size={16} color={COLORS.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Application</Text>
                <Text style={styles.aboutValue}>{appName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.aboutRow}>
              <View style={styles.aboutIconBox}>
                <Sparkles size={16} color={COLORS.textSecondary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>{appVersion}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    gap: SPACING.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
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
  section: {
    gap: SPACING.sm,
  },
  sectionHeaderTitle: {
    fontSize: 12,
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
    gap: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    backgroundColor: '#fafbfc',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    lineHeight: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.textAccent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textAccent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aboutIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutContent: {
    flex: 1,
    gap: 2,
  },
  aboutLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  aboutValue: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
