"use client";

import { useEffect, useState } from "react";
import { useTextSpeaker } from "@/components/TextSpeaker";
import { PhraseManagerInline } from "@/components/PhraseManagerInline";
import { usePhrases, commitPhrases } from "@/lib/storage";
import type { Phrase } from "@/types/phrase";

function createPhraseId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `phrase-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AppShell() {
  const [inputText, setInputText] = useState("");
  const phrases = usePhrases();
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const { speak, status, errorMessage } = useTextSpeaker();

  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 2000);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const canSpeakInput = inputText.trim().length > 0;

  const handleSpeakInput = () => {
    if (!canSpeakInput) return;
    setActivePhraseId(null);
    void speak(inputText);
  };

  const handleAddToPhrases = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const next = [...phrases, { id: createPhraseId(), text: trimmed, createdAt: Date.now() }];
    commitPhrases(next);
    setSavedNotice(true);
  };

  const handleSpeakPhrase = (phrase: Phrase) => {
    setActivePhraseId(phrase.id);
    void speak(phrase.text);
  };

  const handleEditPhrase = (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = phrases.map((p) => (p.id === id ? { ...p, text: trimmed } : p));
    commitPhrases(next);
  };

  const handleDeletePhrase = (id: string) => {
    const next = phrases.filter((p) => p.id !== id);
    commitPhrases(next);
    if (activePhraseId === id) setActivePhraseId(null);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pb-16 pt-10 sm:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-wide text-ink sm:text-3xl">
          こえを咲かせる
        </h1>
        <p className="mt-2 text-sm text-ink/60">声を、そっと届ける</p>
      </header>

      <section className="mb-10 rounded-3xl border border-ink/10 bg-washi/80 p-5 shadow-sm sm:p-7">
        <label htmlFor="free-input" className="sr-only">
          伝えたいことを入力
        </label>
        <textarea
          id="free-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="伝えたいことを入力"
          rows={3}
          autoFocus
          className="w-full resize-none rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-lg leading-relaxed text-ink placeholder:text-ink/30 focus:border-aomidori/50 focus:outline-none focus:ring-2 focus:ring-aomidori/20"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSpeakInput}
            disabled={!canSpeakInput}
            aria-label="入力した文章を話す"
            className="flex-1 rounded-2xl bg-aomidori px-6 py-4 text-lg font-medium text-white shadow-sm transition-all active:scale-[0.98] active:opacity-90 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/30 disabled:shadow-none"
          >
            話す
          </button>
          <button
            type="button"
            onClick={handleAddToPhrases}
            disabled={!canSpeakInput}
            aria-label="入力した文章を定型句に追加"
            className="flex-1 rounded-2xl border border-aomidori/30 bg-white/60 px-6 py-4 text-base font-medium text-aomidori transition-all active:scale-[0.98] active:opacity-80 disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/30"
          >
            定型句に追加
          </button>
        </div>

        <p aria-live="polite" className="mt-3 min-h-[1.5rem] text-center text-sm text-ink/50">
          {status === "speaking" && "読み上げています…"}
          {status === "error" && errorMessage}
          {status === "idle" && savedNotice && "定型句に加えました"}
        </p>
      </section>

      <PhraseManagerInline
        phrases={phrases}
        activePhraseId={status === "speaking" ? activePhraseId : null}
        onSpeak={handleSpeakPhrase}
        onEdit={handleEditPhrase}
        onDelete={handleDeletePhrase}
      />
    </div>
  );
}
