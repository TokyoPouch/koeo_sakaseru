import { useSyncExternalStore } from "react";
import type { Phrase, PhraseCategory } from "@/types/phrase";
import { defaultPhrases } from "@/lib/defaultPhrases";

const STORAGE_KEY = "koeo-sakaseru:phrases";
const CATEGORY_ORDER_KEY = "koeo-sakaseru:categoryOrder";
const CATEGORIES: readonly PhraseCategory[] = ["urgent", "daily", "response", "favorite"];
const DEFAULT_CATEGORY_ORDER: readonly PhraseCategory[] = ["urgent", "daily", "response", "favorite"];

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

// カテゴリー表示順（整える画面で並べ替え可能）。フレーズ本体とは別キーで保存する。
function migrateCategoryOrder(raw: string | null): PhraseCategory[] {
  const known: PhraseCategory[] = [];
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (isKnownCategory(item) && !known.includes(item)) known.push(item);
        }
      }
    } catch {
      // 壊れたデータはデフォルト順で補完する
    }
  }
  // 保存されていない・新しく追加されたカテゴリーは末尾に補う
  for (const category of DEFAULT_CATEGORY_ORDER) {
    if (!known.includes(category)) known.push(category);
  }
  return known;
}

function readCategoryOrderFromStorage(): PhraseCategory[] {
  try {
    const raw = window.localStorage.getItem(CATEGORY_ORDER_KEY);
    const migrated = migrateCategoryOrder(raw);
    writeCategoryOrderToStorage(migrated);
    return migrated;
  } catch {
    return [...DEFAULT_CATEGORY_ORDER];
  }
}

function writeCategoryOrderToStorage(order: PhraseCategory[]): void {
  try {
    window.localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(order));
  } catch {
    // localStorageが使えない環境（プライベートモード等）では保存をスキップする
  }
}

let cachedCategoryOrder: PhraseCategory[] | null = null;
const categoryOrderListeners = new Set<() => void>();

function emitCategoryOrderChange(): void {
  for (const listener of categoryOrderListeners) listener();
}

function subscribeCategoryOrder(listener: () => void): () => void {
  categoryOrderListeners.add(listener);
  return () => categoryOrderListeners.delete(listener);
}

function getCategoryOrderSnapshot(): PhraseCategory[] {
  if (cachedCategoryOrder === null) {
    cachedCategoryOrder = readCategoryOrderFromStorage();
  }
  return cachedCategoryOrder;
}

function getCategoryOrderServerSnapshot(): PhraseCategory[] {
  return DEFAULT_CATEGORY_ORDER as PhraseCategory[];
}

export function commitCategoryOrder(next: PhraseCategory[]): void {
  cachedCategoryOrder = next;
  writeCategoryOrderToStorage(next);
  emitCategoryOrderChange();
}

export function useCategoryOrder(): PhraseCategory[] {
  return useSyncExternalStore(subscribeCategoryOrder, getCategoryOrderSnapshot, getCategoryOrderServerSnapshot);
}
