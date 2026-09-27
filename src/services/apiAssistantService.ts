import { API_CONFIG } from '../config/api';
import { CommandContext, CommandResult } from '../types/command';
import { AssistantActionType } from '../types/assistant';
import { Task } from '../types/task';
import { Plan } from '../types/plan';
import { Note } from '../types/note';
import { Reminder } from '../types/reminder';
import { ScheduleEvent } from '../types/schedule';
import { processCommand } from './assistantService';

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiResponseToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ChatApiResponse {
  response: string;
  tool_calls?: ApiResponseToolCall[];
  provider?: string;
  model?: string;
}

const MODIFYING_TOOLS = new Set([
  'create_task',
  'update_task',
  'complete_task',
  'delete_task',
  'create_note',
  'update_note',
  'delete_note',
  'create_plan',
  'update_plan',
  'complete_plan',
  'create_reminder',
  'update_reminder',
  'complete_reminder',
  'delete_reminder',
]);

/**
 * Health check helper to diagnose backend connectivity across the LAN.
 */
export async function checkBackendHealth(): Promise<{
  ok: boolean;
  status?: string;
  model?: string;
  url: string;
  error?: string;
}> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) {
      return { ok: false, url: API_CONFIG.BASE_URL, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      ok: true,
      status: data.status,
      model: data.model,
      url: API_CONFIG.BASE_URL,
    };
  } catch (err: any) {
    clearTimeout(id);
    const isTimeout = err?.name === 'AbortError';
    return {
      ok: false,
      url: API_CONFIG.BASE_URL,
      error: isTimeout ? 'Timeout connecting to backend' : (err?.message || 'Network unreachable'),
    };
  }
}

/**
 * Send a user query to the FastAPI / NVIDIA NIM backend with automatic local fallback.
 */
export async function sendAssistantMessage(
  query: string,
  history: ChatHistoryItem[],
  context: CommandContext
): Promise<CommandResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const formattedMessages = [
      ...history.slice(-6).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: 'user',
        content: query,
      },
    ];

    const payload = {
      messages: formattedMessages,
      userContext: {
        userName: context.userName || 'Gautam',
        assistantName: context.assistantName || 'Atlas',
        tasks: (context.tasks || []).map((t: Task) => ({
          id: t.id,
          title: t.title,
          time: t.time,
          dateCategory: t.dateCategory,
          dateLabel: t.dateLabel,
          priority: t.priority,
          completed: t.completed,
        })),
        plans: (context.plans || []).map((p: Plan) => ({
          id: p.id,
          name: p.name,
          targetDate: p.targetDate,
          description: p.description,
          completed: p.completed,
        })),
        notes: (context.notes || []).map((n: Note) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          pinned: n.pinned,
          updatedAt: n.updatedAt,
        })),
        reminders: (context.reminders || []).map((r: Reminder) => ({
          id: r.id,
          title: r.title,
          dateCategory: r.dateCategory,
          dateLabel: r.dateLabel,
          time: r.time,
          completed: r.completed,
        })),
        schedule: (context.schedule || []).map((s: ScheduleEvent) => ({
          id: s.id,
          title: s.title,
          time: s.time,
          location: s.location,
          type: s.type,
        })),
      },
    };

    const targetUrl = `${API_CONFIG.BASE_URL}/api/v1/chat`;
    console.log(`[Assistant API Request] Starting POST to ${targetUrl}`);
    console.log(`[Assistant API Request] Timeout: ${API_CONFIG.TIMEOUT_MS}ms, Method: POST`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Assistant API Response] HTTP Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[Assistant API Error] HTTP ${response.status}: ${errText}. Falling back to local parser.`);
      const fallbackResult = processCommand(query, context);
      if (fallbackResult.action === 'unknown') {
        fallbackResult.response = `[Server returned HTTP ${response.status} - Offline Mode]\n\n${fallbackResult.response}`;
      }
      return fallbackResult;
    }

    const data: ChatApiResponse = await response.json();
    console.log(`[Assistant API Response Body] Provider: ${data.provider || 'default'}, Model: ${data.model || 'unknown'}, Tools: ${data.tool_calls?.length || 0}`);

    // If backend reports unconfigured mock key, transparently run through local processor
    if (data.provider === 'mock_unconfigured') {
      return processCommand(query, context);
    }

    if (data.tool_calls && data.tool_calls.length > 0) {
      const tool = data.tool_calls[0];
      const actionName = tool.name as AssistantActionType;
      const requiresConfirmation = MODIFYING_TOOLS.has(tool.name);

      return {
        action: actionName,
        confidence: 0.95,
        payload: tool.arguments || {},
        response: data.response || `I've prepared this action for you: ${tool.name.replace('_', ' ')}`,
        requiresConfirmation,
      };
    }

    return {
      action: 'greeting',
      confidence: 0.9,
      payload: {},
      response: data.response || 'How can I help you today?',
      requiresConfirmation: false,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isTimeout = error?.name === 'AbortError';
    const isNetworkError =
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('failed to fetch');

    let errorReason = 'Backend offline or unreachable';
    if (isTimeout) {
      errorReason = `Request timed out after ${API_CONFIG.TIMEOUT_MS / 1000}s`;
    } else if (isNetworkError) {
      errorReason = `Cannot reach backend at ${API_CONFIG.BASE_URL}. Check network connection`;
    }

    console.warn(`[Assistant API Network Error] ${error?.name}: ${error?.message || errorReason}`);
    console.warn(`[Assistant API] Target was: ${API_CONFIG.BASE_URL}/api/v1/chat. Falling back to local parser.`);
    const fallbackResult = processCommand(query, context);
    if (fallbackResult.action === 'unknown') {
      fallbackResult.response = `[Offline Mode: ${errorReason}]\n\n${fallbackResult.response}`;
    }
    return fallbackResult;
  }
}
