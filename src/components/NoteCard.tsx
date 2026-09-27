import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pin } from 'lucide-react-native';
import { Note } from '../types/note';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onTogglePin?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onPress,
  onTogglePin,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.card, note.pinned && styles.cardPinned]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${note.title}`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        {onTogglePin ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.pinBtn, note.pinned && styles.pinBtnActive]}
            onPress={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin
              size={14}
              color={note.pinned ? COLORS.textAccent : COLORS.textTertiary}
              fill={note.pinned ? COLORS.textAccent : 'transparent'}
            />
          </TouchableOpacity>
        ) : note.pinned ? (
          <Pin size={14} color={COLORS.textAccent} fill={COLORS.textAccent} />
        ) : null}
      </View>

      <Text style={styles.contentPreview} numberOfLines={2}>
        {note.content}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>{note.updatedAt || note.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    shadowRadius: 3,
    elevation: 1,
  },
  cardPinned: {
    borderColor: '#bfdbfe',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  pinBtn: {
    padding: 4,
    borderRadius: RADIUS.full,
  },
  pinBtnActive: {
    backgroundColor: COLORS.accentSoft,
  },
  contentPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },
});
