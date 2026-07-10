"use client";

import { useState } from "react";
import { PhraseCard } from "@/components/PhraseCard";
import type { Phrase } from "@/types/phrase";

interface PhraseManagerInlineProps {
  phrases: Phrase[];
  activePhraseId: string | null;
  onSpeak: (phrase: Phrase) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function PhraseManagerInline({
  phrases,
  activePhraseId,
  onSpeak,
  onEdit,
  onDelete,
}: PhraseManagerInlineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  const startEdit = (phrase: Phrase) => {
    setEditingId(phrase.id);
    setDraftText(phrase.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftText("");
  };

  const confirmEdit = () => {
    if (editingId && draftText.trim().length > 0) {
      onEdit(editingId, draftText);
    }
    cancelEdit();
  };

  const handleDelete = (phrase: Phrase) => {
    if (typeof window !== "undefined" && !window.confirm(`「${phrase.text}」を削除しますか？`)) {
      return;
    }
    onDelete(phrase.id);
  };

  return (
    <section aria-labelledby="phrase-list-heading" className="pb-8">
      <h2 id="phrase-list-heading" className="mb-4 text-lg font-medium text-ink/80">
        よく使うことば
      </h2>

      {phrases.length === 0 ? (
        <p className="text-sm text-ink/50">まだ言葉が登録されていません。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {phrases.map((phrase) =>
            editingId === phrase.id ? (
              <div
                key={phrase.id}
                className="rounded-2xl border border-aomidori/30 bg-white/80 p-4 shadow-sm"
              >
                <label htmlFor={`edit-${phrase.id}`} className="sr-only">
                  ことばを編集
                </label>
                <textarea
                  id={`edit-${phrase.id}`}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  rows={2}
                  autoFocus
                  className="w-full resize-none rounded-xl border border-ink/10 bg-white px-3 py-2 text-base text-ink focus:border-aomidori/50 focus:outline-none focus:ring-2 focus:ring-aomidori/20"
                />
                <div className="mt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2 py-1 text-sm text-ink/50 hover:underline"
                  >
                    やめる
                  </button>
                  <button
                    type="button"
                    onClick={confirmEdit}
                    disabled={draftText.trim().length === 0}
                    className="rounded-lg bg-aomidori px-4 py-1.5 text-sm font-medium text-white disabled:bg-ink/20"
                  >
                    保存する
                  </button>
                </div>
              </div>
            ) : (
              <PhraseCard
                key={phrase.id}
                text={phrase.text}
                isActive={activePhraseId === phrase.id}
                onSpeak={() => onSpeak(phrase)}
                onEdit={() => startEdit(phrase)}
                onDelete={() => handleDelete(phrase)}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}
