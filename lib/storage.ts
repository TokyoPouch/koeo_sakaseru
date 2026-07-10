import { useSyncExternalStore } from "react";
import type { Phrase, PhraseCategory } from "@/types/phrase";
import { defaultPhrases } from "@/lib/defaultPhrases";

const STORAGE_KEY = "koeo-sakaseru:phrases";
const CATEGORIES: readonly PhraseCategory[] = ["urgent", "daily", "response"];

function isKnownCategory(value: unknown): value is PhraseCategory {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

function isBasePhrase(
  value: unknown
): value is { id: string; text: string; createdAt: number } & Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.createdAt === "number"
  );
}

// 旧データ（categoryフィールドが無い保存済みフレーズ）は"daily"として扱う。
function migratePhrase(value: unknown, index: number): Phrase | null {
  if (!isBasePhrase(value)) return null;
  const category = isKnownCategory(value.category) ? value.category : "daily";
  const order = typeof value.order === "number" ? value.order : index;
  return { id: value.id, text: value.text, createdAt: value.createdAt, category, order };
}

function readFromStorage(): Phrase[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPhrases;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultPhrases;
    const migrated = parsed
      .map((item, index) => migratePhrase(item, index))
      .filter((p): p is Phrase => p !== null);
    if (migrated.length === 0) return defaultPhrases;
    writeToStorage(migrated);
    return migrated;
  } catch {
    return defaultPhrases;
  }
}

function writeToStorage(phrases: Phrase[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
  } catch {
    // localStorageが使えない環境（プライベートモード等）では保存をスキップする
  }
}

let cachedPhrases: Phrase[] | null = null;
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Phrase[] {
  if (cachedPhrases === null) {
    cachedPhrases = readFromStorage();
  }
  return cachedPhrases;
}

function getServerSnapshot(): Phrase[] {
  return defaultPhrases;
}

export function commitPhrases(next: Phrase[]): void {
  cachedPhrases = next;
  writeToStorage(next);
  emitChange();
}

export function usePhrases(): Phrase[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
