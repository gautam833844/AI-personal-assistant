import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Plus, Search, ArrowLeft, X } from 'lucide-react-native';
import { NoteCard } from '../components/NoteCard';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { Note } from '../types/note';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface NotesScreenProps {
  onBack: () => void;
  notes: Note[];
  onSaveNote: (
    noteData: { title: string; content: string; pinned: boolean },
    existingNoteId?: string
  ) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  onBack,
  notes,
  onSaveNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Handle save from editor modal
  const handleEditorSave = (noteData: {
    title: string;
    content: string;
    pinned: boolean;
  }) => {
    onSaveNote(noteData, selectedNote?.id);
    setSelectedNote(null);
  };

  // Handle delete from editor modal
  const handleEditorDelete = (id: string) => {
    onDeleteNote(id);
    setSelectedNote(null);
  };

  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query)
    );
  });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
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
          <Text style={styles.headerTitle}>Notes</Text>
          <Text style={styles.headerSubtitle}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={16} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
            >
              <X size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PINNED</Text>
            <View style={styles.notesGrid}>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => {
                    setSelectedNote(note);
                    setIsEditorOpen(true);
                  }}
                  onTogglePin={onTogglePin}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* All/Other Notes Section */}
        <View style={styles.section}>
          {pinnedNotes.length > 0 ? (
            <Text style={styles.sectionTitle}>OTHER NOTES</Text>
          ) : null}

          {otherNotes.length > 0 ? (
            <View style={styles.notesGrid}>
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => {
                    setSelectedNote(note);
                    setIsEditorOpen(true);
                  }}
                  onTogglePin={onTogglePin}
                />
              ))}
            </View>
          ) : pinnedNotes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No notes found' : 'No notes yet. Tap + to create one.'}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating Action Button (+) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => {
          setSelectedNote(null);
          setIsEditorOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Create new note"
      >
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Note Editor Modal */}
      <NoteEditorModal
        visible={isEditorOpen}
        initialNote={selectedNote}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedNote(null);
        }}
        onSave={handleEditorSave}
        onDelete={handleEditorDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  searchWrapper: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  notesGrid: {
    gap: SPACING.md,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 80,
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
