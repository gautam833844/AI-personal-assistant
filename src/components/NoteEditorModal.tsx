import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Pin, Trash2, X } from 'lucide-react-native';
import { Note } from '../types/note';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface NoteEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; content: string; pinned: boolean }) => void;
  onDelete?: (id: string) => void;
  initialNote?: Note | null;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setPinned(initialNote.pinned);
    } else {
      setTitle('');
      setContent('');
      setPinned(false);
    }
  }, [initialNote, visible]);

  const isEditing = Boolean(initialNote);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    onSave({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      pinned,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!initialNote || !onDelete) return;

    Alert.alert(
      'Delete this note?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(initialNote.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.navButton}
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <X size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.navActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.pinBtn, pinned && styles.pinBtnActive]}
              onPress={() => setPinned((prev) => !prev)}
              accessibilityLabel={pinned ? 'Unpin' : 'Pin'}
            >
              <Pin
                size={18}
                color={pinned ? COLORS.textAccent : COLORS.textSecondary}
                fill={pinned ? COLORS.textAccent : 'transparent'}
              />
            </TouchableOpacity>

            {isEditing && onDelete ? (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.deleteBtn}
                onPress={handleDelete}
                accessibilityLabel="Delete note"
              >
                <Trash2 size={18} color="#e11d48" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.saveBtn,
                (!title.trim() && !content.trim()) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() && !content.trim()}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Content Editor */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            style={styles.editorScrollView}
            contentContainerStyle={styles.editorContent}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.titleInput}
              placeholder="Note Title"
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus={!isEditing}
            />

            <TextInput
              style={styles.bodyInput}
              placeholder="Write your note here..."
              placeholderTextColor={COLORS.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pinBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBtnActive: {
    backgroundColor: COLORS.accentSoft,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: '#ffe4e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.textAccent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  editorScrollView: {
    flex: 1,
  },
  editorContent: {
    padding: SPACING.xl,
    gap: SPACING.lg,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingVertical: 4,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 250,
  },
});
