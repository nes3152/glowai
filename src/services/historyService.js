import AsyncStorage from '@react-native-async-storage/async-storage';

import { appendEntry, toHistoryEntry } from '../domain/history';

export const HISTORY_KEY = 'glowai.history.v1';

/**
 * Persists past reports so the result screen can show change over time. Every
 * function swallows storage failures: history is a convenience, and a broken
 * storage layer must never block someone from seeing the report they just ran.
 */
export async function loadHistory(storage = AsyncStorage) {
  try {
    const raw = await storage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Saves `analysis` and resolves with the updated, newest-first history. */
export async function saveAnalysis(analysis, { now = Date.now(), storage = AsyncStorage } = {}) {
  const entries = await loadHistory(storage);
  const next = appendEntry(entries, toHistoryEntry(analysis, now));
  try {
    await storage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Report still renders from memory; only the trend is lost.
  }
  return next;
}

export async function clearHistory(storage = AsyncStorage) {
  try {
    await storage.removeItem(HISTORY_KEY);
  } catch {
    // Nothing to recover from; the next save overwrites whatever is there.
  }
}
