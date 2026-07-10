import { useSyncExternalStore } from "react";
import type { Phrase } from "@/types/phrase";
import { defaultPhrases } from "@/lib/defaultPhrases";

const STORAGE_KEY = "koeo-sakaseru:phrases";

function isPhrase(value: unknown): value is Phrase {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.createdAt === "number"
  );
}

function readFromStorage(): Phrase[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPhrases;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isPhrase)) return defaultPhrases;
    return parsed;
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
