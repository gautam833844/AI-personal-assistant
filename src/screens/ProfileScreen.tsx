import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Edit3,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  Globe,
  MessageSquare,
  SunMoon,
} from 'lucide-react-native';
import {
  Profile,
  ProfilePreferences,
  PreferredLanguage,
  ResponseStyle,
  ThemePreference,
} from '../types/profile';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ProfileScreenProps {
  profile: Profile;
  onBack: () => void;
  onSaveProfile: (updatedProfile: Profile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onBack,
  onSaveProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState(profile.name || '');
  const [preferredName, setPreferredName] = useState(profile.preferredName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');

  const [college, setCollege] = useState(profile.college || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [graduationYear, setGraduationYear] = useState(
    profile.graduationYear ? String(profile.graduationYear) : ''
  );

  const [assistantName, setAssistantName] = useState(
    profile.preferences?.assistantName || 'Atlas'
  );
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>(
    profile.preferences?.preferredLanguage || 'English'
  );
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(
    profile.preferences?.responseStyle || 'Balanced'
  );
  const [theme, setTheme] = useState<ThemePreference>(
    profile.preferences?.theme || 'Light'
  );

  // Sync state if profile prop changes
  useEffect(() => {
    setName(profile.name || '');
    setPreferredName(profile.preferredName || '');
    setEmail(profile.email || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setCollege(profile.college || '');
    setDegree(profile.degree || '');
    setBranch(profile.branch || '');
    setGraduationYear(profile.graduationYear ? String(profile.graduationYear) : '');
    setAssistantName(profile.preferences?.assistantName || 'Atlas');
    setPreferredLanguage(profile.preferences?.preferredLanguage || 'English');
    setResponseStyle(profile.preferences?.responseStyle || 'Balanced');
    setTheme(profile.preferences?.theme || 'Light');
  }, [profile]);

  const handleCancel = () => {
    // Reset to current profile
    setName(profile.name || '');
    setPreferredName(profile.preferredName || '');
    setEmail(profile.email || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setCollege(profile.college || '');
    setDegree(profile.degree || '');
    setBranch(profile.branch || '');
    setGraduationYear(profile.graduationYear ? String(profile.graduationYear) : '');
    setAssistantName(profile.preferences?.assistantName || 'Atlas');
    setPreferredLanguage(profile.preferences?.preferredLanguage || 'English');
    setResponseStyle(profile.preferences?.responseStyle || 'Balanced');
    setTheme(profile.preferences?.theme || 'Light');

    setIsEditing(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    const updatedPreferences: ProfilePreferences = {
      assistantName: assistantName.trim() || 'Atlas',
      preferredLanguage,
      responseStyle,
      theme,
    };

    const updatedProfile: Profile = {
      ...profile,
      name: name.trim(),
      preferredName: preferredName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
      bio: bio.trim() || undefined,
      college: college.trim() || undefined,
      degree: degree.trim() || undefined,
      branch: branch.trim() || undefined,
      graduationYear: graduationYear.trim() ? graduationYear.trim() : undefined,
      preferences: updatedPreferences,
    };

    onSaveProfile(updatedProfile);
    setIsEditing(false);
  };

  // Helper avatar initials
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || 'ME';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerIconBtn}
          onPress={isEditing ? handleCancel : onBack}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Cancel editing' : 'Back to More'}
        >
          {isEditing ? (
            <X size={20} color={COLORS.textSecondary} />
          ) : (
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          )}
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Profile' : 'My Information'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? 'Update your local details' : 'Personal facts & assistant settings'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.headerActionBtn, isEditing && styles.headerSaveBtn]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Save profile' : 'Edit profile'}
        >
          {isEditing ? (
            <>
              <Check size={16} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>Save</Text>
            </>
          ) : (
            <>
              <Edit3 size={15} color={COLORS.textAccent} />
              <Text style={styles.editBtnText}>Edit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroName}>{name || 'Unnamed User'}</Text>
            {Boolean(degree || branch) && (
              <Text style={styles.heroSub}>
                {[degree, branch].filter(Boolean).join(' in ')}
              </Text>
            )}
            {Boolean(location) && (
              <View style={styles.heroLocationRow}>
                <MapPin size={12} color={COLORS.textTertiary} />
                <Text style={styles.heroLocation}>{location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 1. PERSONAL SECTION                                                       */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>PERSONAL</Text>
          <View style={styles.card}>
            {isEditing ? (
              <View style={styles.formFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PREFERRED NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={preferredName}
                    onChangeText={setPreferredName}
                    placeholder="e.g. Gautam"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="e.g. name@example.com"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PHONE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. +91 98765 43210"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>LOCATION</Text>
                  <TextInput
                    style={styles.textInput}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="e.g. Hyderabad, India"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BIO / ABOUT</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Short bio about yourself..."
                    placeholderTextColor={COLORS.textTertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <User size={16} color={COLORS.textAccent} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{name || 'Not specified'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <User size={16} color={COLORS.textSecondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Preferred Name</Text>
                    <Text style={styles.infoValue}>
                      {preferredName || 'Not specified'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Mail size={16} color={COLORS.textSecondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{email || 'Not specified'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Phone size={16} color={COLORS.textSecondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{phone || 'Not specified'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <MapPin size={16} color={COLORS.textSecondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>
                      {location || 'Not specified'}
                    </Text>
                  </View>
                </View>

                {Boolean(bio) && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.iconBox}>
                        <FileText size={16} color={COLORS.textSecondary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Bio</Text>
                        <Text style={styles.infoValue}>{bio}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 2. EDUCATION SECTION                                                      */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>EDUCATION</Text>
          <View style={styles.card}>
            {isEditing ? (
              <View style={styles.formFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>COLLEGE / UNIVERSITY</Text>
                  <TextInput
                    style={styles.textInput}
                    value={college}
                    onChangeText={setCollege}
                    placeholder="e.g. Engineering Institute of Technology"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DEGREE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={degree}
                    onChangeText={setDegree}
                    placeholder="e.g. B.Tech"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH / MAJOR</Text>
                  <TextInput
                    style={styles.textInput}
                    value={branch}
                    onChangeText={setBranch}
                    placeholder="e.g. Computer Science and Engineering"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>GRADUATION YEAR</Text>
                  <TextInput
                    style={styles.textInput}
                    value={graduationYear}
                    onChangeText={setGraduationYear}
                    placeholder="e.g. 2027"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <GraduationCap size={16} color="#059669" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>College / University</Text>
                    <Text style={styles.infoValue}>
                      {college || 'Not specified'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <BookOpen size={16} color="#059669" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Degree & Branch</Text>
                    <Text style={styles.infoValue}>
                      {[degree, branch].filter(Boolean).join(' - ') ||
                        'Not specified'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Calendar size={16} color="#059669" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Graduation Year</Text>
                    <Text style={styles.infoValue}>
                      {graduationYear || 'Not specified'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 3. ASSISTANT PREFERENCES                                                 */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>ASSISTANT PREFERENCES</Text>
          <View style={styles.card}>
            {isEditing ? (
              <View style={styles.formFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ASSISTANT NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    value={assistantName}
                    onChangeText={setAssistantName}
                    placeholder="e.g. Atlas"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>

                {/* Preferred Language */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PREFERRED LANGUAGE</Text>
                  <View style={styles.chipsRow}>
                    {(['English', 'Telugu', 'Hindi'] as PreferredLanguage[]).map(
                      (lang) => (
                        <TouchableOpacity
                          key={lang}
                          activeOpacity={0.7}
                          style={[
                            styles.chip,
                            preferredLanguage === lang && styles.chipActive,
                          ]}
                          onPress={() => setPreferredLanguage(lang)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              preferredLanguage === lang && styles.chipTextActive,
                            ]}
                          >
                            {lang}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Response Style */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>RESPONSE STYLE</Text>
                  <View style={styles.chipsRow}>
                    {(['Concise', 'Balanced', 'Detailed'] as ResponseStyle[]).map(
                      (style) => (
                        <TouchableOpacity
                          key={style}
                          activeOpacity={0.7}
                          style={[
                            styles.chip,
                            responseStyle === style && styles.chipActive,
                          ]}
                          onPress={() => setResponseStyle(style)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              responseStyle === style && styles.chipTextActive,
                            ]}
                          >
                            {style}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Theme */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>THEME</Text>
                  <View style={styles.chipsRow}>
                    {(['Light', 'Dark', 'System'] as ThemePreference[]).map(
                      (t) => (
                        <TouchableOpacity
                          key={t}
                          activeOpacity={0.7}
                          style={[
                            styles.chip,
                            theme === t && styles.chipActive,
                          ]}
                          onPress={() => setTheme(t)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              theme === t && styles.chipTextActive,
                            ]}
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
                    <Sparkles size={16} color="#9333ea" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Assistant Name</Text>
                    <Text style={styles.infoValue}>
                      {profile.preferences?.assistantName || 'Atlas'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
                    <Globe size={16} color="#9333ea" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Preferred Language</Text>
                    <Text style={styles.infoValue}>
                      {profile.preferences?.preferredLanguage || 'English'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
                    <MessageSquare size={16} color="#9333ea" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Response Style</Text>
                    <Text style={styles.infoValue}>
                      {profile.preferences?.responseStyle || 'Balanced'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
                    <SunMoon size={16} color="#9333ea" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Theme Preference</Text>
                    <Text style={styles.infoValue}>
                      {profile.preferences?.theme || 'Light'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
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
  headerIconBtn: {
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
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  headerSaveBtn: {
    backgroundColor: COLORS.textAccent,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textAccent,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 120,
    gap: SPACING.xl,
  },
  heroCard: {
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroTextWrap: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  heroLocation: {
    fontSize: 12,
    color: COLORS.textTertiary,
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
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  formFields: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#fafbfc',
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
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
});
