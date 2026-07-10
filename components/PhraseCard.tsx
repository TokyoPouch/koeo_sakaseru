"use client";

interface PhraseCardProps {
  text: string;
  isActive: boolean;
  onSpeak: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PhraseCard({ text, isActive, onSpeak, onEdit, onDelete }: PhraseCardProps) {
  return (
    <div
      className={`rounded-2xl border border-ink/10 bg-washi px-5 py-4 shadow-sm transition-all duration-200 ${
        isActive ? "scale-[0.98] bg-mizu/50 shadow-inner" : "shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={onSpeak}
        aria-label={`「${text}」を話す`}
        className="block w-full text-left text-lg leading-relaxed text-ink transition-transform active:scale-[0.97] active:opacity-80"
      >
        {text}
      </button>
      <div className="mt-3 flex justify-end gap-4">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`「${text}」を編集`}
          className="px-1 py-1 text-xs text-aomidori/70 hover:text-aomidori hover:underline"
        >
          編集
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`「${text}」を削除`}
          className="px-1 py-1 text-xs text-ink/40 hover:text-ink/60 hover:underline"
        >
          削除
        </button>
      </div>
    </div>
  );
}
