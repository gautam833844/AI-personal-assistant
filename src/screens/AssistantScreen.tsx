import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Send,
  Mic,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  Target,
  Bell,
  BookOpen,
  MapPin,
  Trash2,
  Edit3,
} from 'lucide-react-native';
import { AssistantMessage } from '../types/assistant';
import { CommandResult } from '../types/command';
import { Task } from '../types/task';
import { Plan } from '../types/plan';
import { Note } from '../types/note';
import { Reminder, ReminderDateCategory } from '../types/reminder';
import { Profile } from '../types/profile';
import { sendAssistantMessage, checkBackendHealth } from '../services/apiAssistantService';
import { API_CONFIG } from '../config/api';
import { SAMPLE_EVENTS } from '../data/sampleSchedule';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface AssistantScreenProps {
  onBack: () => void;
  initialQuery?: string;
  tasks: Task[];
  plans: Plan[];
  notes: Note[];
  reminders: Reminder[];
  profile?: Profile;
  onAddTask: (newTaskData: Omit<Task, 'id' | 'completed'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSaveNote: (
    noteData: { title: string; content: string; pinned: boolean },
    existingNoteId?: string
  ) => void;
  onDeleteNote: (id: string) => void;
  onSavePlan: (
    planData: { name: string; targetDate: string; description?: string },
    editingPlanId?: string
  ) => void;
  onToggleCompletePlan: (id: string) => void;
  onSaveReminder: (
    reminderData: {
      title: string;
      dateCategory: ReminderDateCategory;
      dateLabel: string;
      time: string;
    },
    existingReminderId?: string
  ) => void;
  onToggleCompleteReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  onBack,
  initialQuery,
  tasks,
  plans,
  notes,
  reminders,
  profile,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSaveNote,
  onDeleteNote,
  onSavePlan,
  onToggleCompletePlan,
  onSaveReminder,
  onToggleCompleteReminder,
  onDeleteReminder,
}) => {
  const assistantName = profile?.preferences?.assistantName || 'Atlas';
  const userName = profile?.preferredName || profile?.name || 'Gautam';

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [backendError, setBackendError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: `Hi ${userName} 👋 I'm ${assistantName}. How can I help you today?`,
      createdAt: 'Just now',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);
  const initialProcessedRef = useRef(false);

  const testBackendReachability = async () => {
    setBackendStatus('checking');
    const result = await checkBackendHealth();
    if (result.ok) {
      setBackendStatus('connected');
      setBackendError(null);
    } else {
      setBackendStatus('offline');
      setBackendError(result.error || 'Cannot reach server');
    }
  };

  useEffect(() => {
    testBackendReachability();
  }, []);

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSend = async (textToSend?: string) => {
    const rawQuery = textToSend !== undefined ? textToSend : input;
    const query = rawQuery.trim();
    if (!query || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: formatTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const commandResult: CommandResult = await sendAssistantMessage(
        query,
        history,
        {
          userName,
          assistantName,
          tasks,
          plans,
          notes,
          reminders,
          profile,
          schedule: SAMPLE_EVENTS,
        }
      );

      const assistantMsg: AssistantMessage = {
        id: `msg_a_${Date.now() + 1}`,
        role: 'assistant',
        content: commandResult.response,
        createdAt: formatTimestamp(),
        actionResult: commandResult,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: AssistantMessage = {
        id: `msg_a_err_${Date.now() + 1}`,
        role: 'assistant',
        content: `I'm here to help! Let me know what you need with your tasks, notes, plans, or schedule.`,
        createdAt: formatTimestamp(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial query if passed from Home screen
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && !initialProcessedRef.current) {
      initialProcessedRef.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Auto-scroll on new message or loading state change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Action Confirmation Handlers
  const handleConfirmAction = (messageId: string, result: CommandResult) => {
    const { action, payload } = result;

    if (action === 'create_task') {
      onAddTask({
        title: payload.title || 'New Task',
        time: payload.time || '05:00 PM',
        dateCategory: payload.dateCategory || 'today',
        dateLabel: payload.dateLabel || 'Today',
        priority: payload.priority || 'normal',
      });
    } else if (action === 'update_task') {
      const targetId = payload.taskId || payload.id;
      if (targetId) {
        // If task exists, we can re-add with updated properties or toggle
        onAddTask({
          title: payload.title || 'Updated Task',
          time: payload.time || '05:00 PM',
          dateCategory: payload.dateCategory || 'today',
          dateLabel: payload.dateLabel || 'Today',
          priority: payload.priority || 'normal',
        });
        onDeleteTask(targetId);
      }
    } else if (action === 'complete_task') {
      const targetId = payload.taskId || payload.id;
      if (targetId) {
        onToggleTask(targetId);
      }
    } else if (action === 'delete_task') {
      const targetId = payload.taskId || payload.id;
      if (targetId) {
        onDeleteTask(targetId);
      }
    } else if (action === 'create_note') {
      onSaveNote({
        title: payload.title || 'Quick Note',
        content: payload.content || '',
        pinned: Boolean(payload.pinned),
      });
    } else if (action === 'update_note') {
      const targetId = payload.noteId || payload.id;
      onSaveNote(
        {
          title: payload.title || 'Updated Note',
          content: payload.content || '',
          pinned: Boolean(payload.pinned),
        },
        targetId
      );
    } else if (action === 'delete_note') {
      const targetId = payload.noteId || payload.id;
      if (targetId) {
        onDeleteNote(targetId);
      }
    } else if (action === 'create_plan') {
      onSavePlan({
        name: payload.name || 'New Plan',
        targetDate: payload.targetDate || 'Next Month',
        description: payload.description,
      });
    } else if (action === 'update_plan') {
      const targetId = payload.planId || payload.id;
      onSavePlan(
        {
          name: payload.name || 'Updated Plan',
          targetDate: payload.targetDate || 'Next Month',
          description: payload.description,
        },
        targetId
      );
    } else if (action === 'complete_plan') {
      const targetId = payload.planId || payload.id;
      if (targetId) {
        onToggleCompletePlan(targetId);
      }
    } else if (action === 'create_reminder') {
      onSaveReminder({
        title: payload.title || 'Reminder',
        dateCategory: payload.dateCategory || 'today',
        dateLabel: payload.dateLabel || 'Today',
        time: payload.time || '04:00 PM',
      });
    } else if (action === 'update_reminder') {
      const targetId = payload.reminderId || payload.id;
      onSaveReminder(
        {
          title: payload.title || 'Updated Reminder',
          dateCategory: payload.dateCategory || 'today',
          dateLabel: payload.dateLabel || 'Today',
          time: payload.time || '04:00 PM',
        },
        targetId
      );
    } else if (action === 'complete_reminder') {
      const targetId = payload.reminderId || payload.id;
      if (targetId) {
        onToggleCompleteReminder(targetId);
      }
    } else if (action === 'delete_reminder') {
      const targetId = payload.reminderId || payload.id;
      if (targetId) {
        onDeleteReminder(targetId);
      }
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isConfirmed: true,
            }
          : msg
      )
    );

    // Follow-up confirmation message
    const feedbackMsg: AssistantMessage = {
      id: `msg_a_conf_${Date.now()}`,
      role: 'assistant',
      content: `Done! I've executed that action for you.`,
      createdAt: formatTimestamp(),
    };
    setMessages((prev) => [...prev, feedbackMsg]);
  };

  const handleCancelAction = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isCancelled: true,
            }
          : msg
      )
    );

    const cancelFeedbackMsg: AssistantMessage = {
      id: `msg_a_canc_${Date.now()}`,
      role: 'assistant',
      content: `Cancelled. Let me know if you need anything else!`,
      createdAt: formatTimestamp(),
    };
    setMessages((prev) => [...prev, cancelFeedbackMsg]);
  };

  const getConfirmButtonText = (action?: string) => {
    switch (action) {
      case 'create_task':
        return 'Add Task';
      case 'update_task':
        return 'Update Task';
      case 'complete_task':
        return 'Mark Done';
      case 'delete_task':
        return 'Delete Task';
      case 'create_note':
        return 'Create Note';
      case 'update_note':
        return 'Update Note';
      case 'delete_note':
        return 'Delete Note';
      case 'create_plan':
        return 'Create Plan';
      case 'update_plan':
        return 'Update Plan';
      case 'complete_plan':
        return 'Mark Completed';
      case 'create_reminder':
        return 'Create Reminder';
      case 'update_reminder':
        return 'Update Reminder';
      case 'complete_reminder':
        return 'Mark Done';
      case 'delete_reminder':
        return 'Delete Reminder';
      default:
        return 'Confirm';
    }
  };

  const isDestructiveAction = (action?: string) => {
    return action?.startsWith('delete_');
  };

  // Render Read-Only Data Cards inside message bubble
  const renderReadonlyData = (
    action: string,
    payload?: Record<string, any>
  ) => {
    if (action === 'show_next_class') {
      const nextClass = SAMPLE_EVENTS.find((e) => e.type === 'class') || SAMPLE_EVENTS[0];
      if (!nextClass) return null;
      return (
        <View style={styles.highlightCard}>
          <View style={styles.highlightIcon}>
            <BookOpen size={18} color={COLORS.textAccent} />
          </View>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>{nextClass.title}</Text>
            <View style={styles.highlightMetaRow}>
              <Clock size={12} color={COLORS.textSecondary} />
              <Text style={styles.highlightMeta}>{nextClass.time}</Text>
              <Text style={styles.highlightDot}>•</Text>
              <MapPin size={12} color={COLORS.textSecondary} />
              <Text style={styles.highlightMeta}>{nextClass.location}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (action === 'list_tasks' || action === 'get_tasks') {
      const active = tasks.filter((t) => !t.completed);
      if (active.length === 0) {
        return (
          <View style={styles.dataPreviewBox}>
            <Text style={styles.dataEmptyText}>No pending tasks right now.</Text>
          </View>
        );
      }
      return (
        <View style={styles.dataPreviewBox}>
          {active.slice(0, 5).map((t) => (
            <View key={t.id} style={styles.dataItemRow}>
              <CheckSquare size={14} color={COLORS.textAccent} />
              <Text style={styles.dataItemText} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={styles.dataItemMeta}>{t.time}</Text>
            </View>
          ))}
          {active.length > 5 && (
            <Text style={styles.dataMoreText}>+{active.length - 5} more tasks</Text>
          )}
        </View>
      );
    }

    if (action === 'list_notes' || action === 'get_notes') {
      if (notes.length === 0) {
        return (
          <View style={styles.dataPreviewBox}>
            <Text style={styles.dataEmptyText}>No notes found.</Text>
          </View>
        );
      }
      return (
        <View style={styles.dataPreviewBox}>
          {notes.slice(0, 4).map((n) => (
            <View key={n.id} style={styles.dataItemRow}>
              <FileText size={14} color={COLORS.textAccent} />
              <Text style={styles.dataItemText} numberOfLines={1}>
                {n.title}
              </Text>
              <Text style={styles.dataItemMeta}>{n.updatedAt}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (action === 'list_plans' || action === 'get_plans') {
      const activePlans = plans.filter((p) => !p.completed);
      if (activePlans.length === 0) {
        return (
          <View style={styles.dataPreviewBox}>
            <Text style={styles.dataEmptyText}>No active plans found.</Text>
          </View>
        );
      }
      return (
        <View style={styles.dataPreviewBox}>
          {activePlans.slice(0, 4).map((p) => (
            <View key={p.id} style={styles.dataItemRow}>
              <Target size={14} color="#9333ea" />
              <Text style={styles.dataItemText} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.dataItemMeta}>{p.targetDate}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (action === 'list_reminders' || action === 'get_reminders') {
      const activeReminders = reminders.filter((r) => !r.completed);
      if (activeReminders.length === 0) {
        return (
          <View style={styles.dataPreviewBox}>
            <Text style={styles.dataEmptyText}>No active reminders.</Text>
          </View>
        );
      }
      return (
        <View style={styles.dataPreviewBox}>
          {activeReminders.slice(0, 4).map((r) => (
            <View key={r.id} style={styles.dataItemRow}>
              <Bell size={14} color="#ea580c" />
              <Text style={styles.dataItemText} numberOfLines={1}>
                {r.title}
              </Text>
              <Text style={styles.dataItemMeta}>{r.time}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (action === 'show_schedule' || action === 'get_schedule' || action === 'show_tomorrow') {
      const rawDay = (payload?.day as string | undefined)?.trim();
      const targetDay = rawDay ? rawDay.toLowerCase() : undefined;

      const eventsForDisplay = targetDay
        ? SAMPLE_EVENTS.filter(
            (e) =>
              e.days?.some((d) => d.toLowerCase() === targetDay) ||
              e.day?.toLowerCase() === targetDay
          )
        : SAMPLE_EVENTS;

      if (eventsForDisplay.length === 0) {
        return (
          <View style={styles.dataPreviewBox}>
            <Text style={styles.dataEmptyText}>
              No classes or events scheduled for {rawDay || 'this day'}.
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.dataPreviewBox}>
          {eventsForDisplay.map((event) => (
            <View key={event.id} style={styles.dataItemRow}>
              <BookOpen size={14} color={COLORS.textAccent} />
              <Text style={styles.dataItemText} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.dataItemMeta}>{event.time}</Text>
            </View>
          ))}
        </View>
      );
    }

    return null;
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
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          <Sparkles size={18} color="#ffffff" />
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{assistantName}</Text>
          <Text style={styles.headerSubtitle}>Personal AI Assistant</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.statusPill,
            backendStatus === 'connected'
              ? styles.statusPillOnline
              : backendStatus === 'checking'
              ? styles.statusPillChecking
              : styles.statusPillOffline,
          ]}
          onPress={testBackendReachability}
          accessibilityRole="button"
          accessibilityLabel="Test Backend Connection"
        >
          <View
            style={[
              styles.statusDot,
              backendStatus === 'connected'
                ? styles.statusDotOnline
                : backendStatus === 'checking'
                ? styles.statusDotChecking
                : styles.statusDotOffline,
            ]}
          />
          <Text
            style={[
              styles.statusPillText,
              backendStatus === 'connected'
                ? styles.statusPillTextOnline
                : backendStatus === 'checking'
                ? styles.statusPillTextChecking
                : styles.statusPillTextOffline,
            ]}
          >
            {backendStatus === 'connected'
              ? 'Online'
              : backendStatus === 'checking'
              ? 'Checking...'
              : 'Offline (Tap)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversation Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const actionResult = msg.actionResult;
          const requiresConfirmation = actionResult?.requiresConfirmation;
          const destructive = isDestructiveAction(actionResult?.action);

          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAssistant,
              ]}
            >
              {!isUser && (
                <View style={styles.assistantBubbleAvatar}>
                  <Sparkles size={13} color="#9333ea" />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userMessageText : styles.assistantMessageText,
                  ]}
                >
                  {msg.content}
                </Text>

                {/* Structured Confirmation Card */}
                {requiresConfirmation && (
                  <View style={styles.confirmationCard}>
                    {msg.isConfirmed ? (
                      <View style={styles.statusRow}>
                        <CheckCircle2 size={16} color="#059669" />
                        <Text style={styles.statusTextConfirmed}>
                          Action Executed & Saved
                        </Text>
                      </View>
                    ) : msg.isCancelled ? (
                      <View style={styles.statusRow}>
                        <XCircle size={16} color="#e11d48" />
                        <Text style={styles.statusTextCancelled}>
                          Action Cancelled
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.confirmActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.cancelActionBtn}
                          onPress={() => handleCancelAction(msg.id)}
                        >
                          <Text style={styles.cancelActionBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.75}
                          style={[
                            styles.confirmActionBtn,
                            destructive && styles.confirmActionBtnDestructive,
                          ]}
                          onPress={() => handleConfirmAction(msg.id, actionResult!)}
                        >
                          {destructive && <Trash2 size={13} color="#ffffff" style={{ marginRight: 4 }} />}
                          <Text style={styles.confirmActionBtnText}>
                            {getConfirmButtonText(actionResult?.action)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Read-only Data Preview */}
                {!isUser &&
                  actionResult &&
                  !requiresConfirmation &&
                  renderReadonlyData(actionResult.action, actionResult.payload)}

                <Text
                  style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.assistantTimestamp,
                  ]}
                >
                  {msg.createdAt}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Typing / Thinking Indicator */}
        {isLoading && (
          <View style={[styles.messageRow, styles.messageRowAssistant]}>
            <View style={styles.assistantBubbleAvatar}>
              <Sparkles size={13} color="#9333ea" />
            </View>
            <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={COLORS.textAccent} />
              <Text style={styles.loadingBubbleText}>{assistantName} is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Input Area */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.textInput}
            placeholder="What do you need?"
            placeholderTextColor={COLORS.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={!isLoading}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.micBtn}
            accessibilityRole="button"
            accessibilityLabel="Voice input (UI only)"
          >
            <Mic size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantBubbleAvatar: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.full,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.md,
    gap: 6,
  },
  userBubble: {
    backgroundColor: COLORS.textAccent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.sm + 4,
  },
  loadingBubbleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  assistantMessageText: {
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 10.5,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  assistantTimestamp: {
    color: COLORS.textTertiary,
  },
  confirmationCard: {
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: 4,
    gap: 8,
  },
  confirmActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardSubtle,
  },
  cancelActionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.textAccent,
  },
  confirmActionBtnDestructive: {
    backgroundColor: '#e11d48',
  },
  confirmActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  statusTextConfirmed: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#059669',
  },
  statusTextCancelled: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#e11d48',
  },
  highlightCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightContent: {
    flex: 1,
    gap: 2,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  highlightMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highlightMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  highlightDot: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  dataPreviewBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    gap: 6,
    marginTop: 4,
  },
  dataItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  dataItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  dataItemMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  dataEmptyText: {
    fontSize: 12.5,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  dataMoreText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textAccent,
    marginTop: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    marginBottom: Platform.OS === 'ios' ? 10 : 70,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    paddingVertical: 6,
  },
  micBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.textAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 5,
    borderWidth: 1,
  },
  statusPillOnline: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusPillChecking: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  statusPillOffline: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotOnline: {
    backgroundColor: '#10b981',
  },
  statusDotChecking: {
    backgroundColor: '#3b82f6',
  },
  statusDotOffline: {
    backgroundColor: '#ef4444',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusPillTextOnline: {
    color: '#047857',
  },
  statusPillTextChecking: {
    color: '#1d4ed8',
  },
  statusPillTextOffline: {
    color: '#b91c1c',
  },
});
