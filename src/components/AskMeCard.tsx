import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Mic } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface AskMeCardProps {
  onOpenAssistant?: (initialQuery?: string) => void;
}

export const AskMeCard: React.FC<AskMeCardProps> = ({ onOpenAssistant }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (onOpenAssistant) {
      onOpenAssistant(query.trim() || undefined);
      setQuery('');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => onOpenAssistant?.(query.trim() || undefined)}
      accessibilityRole="button"
      accessibilityLabel="Ask assistant"
    >
      <View style={styles.iconWrap}>
        <Search size={18} color={COLORS.textTertiary} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="What do you need?"
        placeholderTextColor={COLORS.textTertiary}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.micButton}
        onPress={() => onOpenAssistant?.()}
        accessibilityRole="button"
        accessibilityLabel="Voice input"
      >
        <Mic size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrap: {
    paddingLeft: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
