"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useTextSpeaker } from "@/components/TextSpeaker";
import { SpeakButton } from "@/components/SpeakButton";
import { CategorizedPhraseList } from "@/components/CategorizedPhraseList";
import { EditModeList } from "@/components/EditModeList";
import { UndoToast } from "@/components/UndoToast";
import { usePhrases, commitPhrases } from "@/lib/storage";
import type { Phrase, PhraseCategory } from "@/types/phrase";

const MAX_INPUT_LENGTH = 120;

function createPhraseId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `phrase-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextOrder(phrases: Phrase[]): number {
  return phrases.reduce((max, p) => Math.max(max, p.order), -1) + 1;
}

export function AppShell() {
  const [inputText, setInputText] = useState("");
  const phrases = usePhrases();
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ phrase: Phrase; previous: Phrase[] } | null>(
    null
  );
  const { speak, status, errorMessage } = useTextSpeaker();

  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 2000);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const canSpeakInput = inputText.trim().length > 0;
  const isInputSpeaking = status === "speaking" && activePhraseId === null;

  const handleSpeakInput = () => {
    if (!canSpeakInput) return;
    setActivePhraseId(null);
    void speak(inputText, "__input__");
  };

  const handleAddToPhrases = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const next = [
      ...phrases,
      {
        id: createPhraseId(),
        text: trimmed,
        createdAt: Date.now(),
        category: "daily" as PhraseCategory,
        order: nextOrder(phrases),
      },
    ];
    commitPhrases(next);
    setSavedNotice(true);
  };

  const handleSpeakPhrase = (phrase: Phrase) => {
    setActivePhraseId(phrase.id);
    void speak(phrase.text, phrase.id);
  };

  const handleEditPhrase = (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = phrases.map((p) => (p.id === id ? { ...p, text: trimmed } : p));
    commitPhrases(next);
  };

  const handleDeletePhrase = (phrase: Phrase) => {
    const previous = phrases;
    const next = phrases.filter((p) => p.id !== phrase.id);
    commitPhrases(next);
    setPendingDelete({ phrase, previous });
    if (activePhraseId === phrase.id) setActivePhraseId(null);
  };

  const handleUndoDelete = () => {
    if (!pendingDelete) return;
    commitPhrases(pendingDelete.previous);
    setPendingDelete(null);
  };

  const handleReorder = (next: Phrase[]) => {
    commitPhrases(next);
  };

  const handleAddPhrase = (text: string, category: PhraseCategory) => {
    const next = [
      ...phrases,
      {
        id: createPhraseId(),
        text,
        createdAt: Date.now(),
        category,
        order: nextOrder(phrases),
      },
    ];
    commitPhrases(next);
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="motif pointer-events-none absolute -top-2 right-2 h-24 w-24 sm:right-6 sm:h-32 sm:w-32"
      >
        <path
          d="M100 170 C60 150 40 110 55 70 C65 42 90 28 100 20 C110 28 135 42 145 70 C160 110 140 150 100 170 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M100 170 C98 130 100 70 100 24" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      {isEditMode ? (
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="text-sm text-ink/60"
          >
            キャンセル
          </button>
          <span className="text-sm font-medium text-ink/50">整える</span>
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="text-sm font-semibold text-aomidori"
          >
            完了
          </button>
        </div>
      ) : (
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-light tracking-wide text-ink sm:text-3xl">こえを咲かせる</h1>
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="shrink-0 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink/70 transition-colors active:bg-ink/5"
          >
            整える
          </button>
        </header>
      )}

      {isEditMode ? (
        <section aria-labelledby="edit-list-heading">
          <h2 id="edit-list-heading" className="sr-only">
            ことばを整える
          </h2>
          <EditModeList
            phrases={phrases}
            onReorder={handleReorder}
            onEdit={handleEditPhrase}
            onDelete={handleDeletePhrase}
            onAdd={handleAddPhrase}
          />
        </section>
      ) : (
        <>
          <section className="washi-canvas mb-10 rounded-[28px] p-6 sm:p-8">
            <label htmlFor="free-input" className="sr-only">
              伝えたいことを入力
            </label>
            <div className="relative">
              <textarea
                id="free-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                placeholder="伝えたいことを書く…"
                rows={3}
                maxLength={MAX_INPUT_LENGTH}
                autoFocus
                className="washi-textarea w-full resize-none rounded-2xl px-5 py-4 pb-8 text-lg leading-relaxed text-ink placeholder:text-ink/30"
              />
              <span
                className={`pointer-events-none absolute bottom-2.5 right-4 text-xs ${
                  inputText.length >= MAX_INPUT_LENGTH ? "text-red-500" : "text-usuzumi/70"
                }`}
              >
                {inputText.length}/{MAX_INPUT_LENGTH}
              </span>
            </div>

            <div className="relative z-10 mt-6 flex items-center justify-center gap-4">
              <SpeakButton
                isSpeaking={isInputSpeaking}
                disabled={!canSpeakInput && !isInputSpeaking}
                onClick={handleSpeakInput}
              />
              <button
                type="button"
                onClick={handleAddToPhrases}
                disabled={!canSpeakInput}
                aria-label="このことばを残す"
                className="flex flex-col items-center gap-1 rounded-2xl border border-aomidori/25 bg-washi/50 px-4 py-3 text-xs font-medium text-aomidori-deep transition-all active:scale-[0.98] active:opacity-80 disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/30"
              >
                <Bookmark aria-hidden="true" strokeWidth={1.5} className="h-5 w-5" />
                <span>このことばを残す</span>
              </button>
            </div>

            <p aria-live="polite" className="relative z-10 mt-3 min-h-[1.5rem] text-center text-sm text-ink/50">
              {(status === "error" || status === "notice") && errorMessage}
              {status === "idle" && savedNotice && "このことばを残しました"}
            </p>
          </section>

          <CategorizedPhraseList
            phrases={phrases}
            activePhraseId={status === "speaking" ? activePhraseId : null}
            onSpeak={handleSpeakPhrase}
          />
        </>
      )}

      {pendingDelete && (
        <UndoToast
          message={`「${pendingDelete.phrase.text}」を削除しました`}
          onUndo={handleUndoDelete}
          onDismiss={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
