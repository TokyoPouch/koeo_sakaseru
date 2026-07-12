"use client";

import type { LucideIcon } from "lucide-react";

interface PhraseCardProps {
  text: string;
  icon: LucideIcon | null;
  isActive: boolean;
  tone?: "neutral" | "response";
  variant?: "a" | "b" | "c";
  isUrgent?: boolean;
  layout?: "tile" | "row";
  rowSizeClassName?: string;
  onSpeak: () => void;
}

export function PhraseCard({
  text,
  icon: Icon,
  isActive,
  tone = "neutral",
  variant = "a",
  isUrgent = false,
  layout = "tile",
  rowSizeClassName = "",
  onSpeak,
}: PhraseCardProps) {
  const toneClassName = tone === "response" ? "phrase-card--b" : `phrase-card--${variant}`;
  const activeClassName = isActive ? "scale-[0.98] shadow-inner" : "";

  if (layout === "row") {
    return (
      <button
        type="button"
        onClick={onSpeak}
        aria-label={`「${text}」を話す`}
        className={`phrase-card flex w-full items-center gap-3 rounded-xl text-left transition-all duration-200 active:scale-[0.98] active:opacity-90 ${rowSizeClassName} ${toneClassName} ${
          isUrgent ? "phrase-card--urgent" : ""
        } ${activeClassName}`}
      >
        {Icon ? (
          <Icon aria-hidden="true" strokeWidth={1.5} className="relative z-10 h-5 w-5 shrink-0 text-ink/60" />
        ) : null}
        <span className="relative z-10 truncate text-sm leading-snug text-ink sm:text-base">{text}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={`「${text}」を話す`}
      className={`phrase-card flex min-h-[96px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl px-3 py-5 text-center transition-all duration-200 active:scale-[0.97] active:opacity-90 ${toneClassName} ${
        isUrgent ? "phrase-card--urgent" : ""
      } ${activeClassName}`}
    >
      {Icon ? <Icon aria-hidden="true" strokeWidth={1.5} className="relative z-10 h-6 w-6 text-ink/60" /> : null}
      <span className="relative z-10 text-sm leading-snug text-ink sm:text-base">{text}</span>
    </button>
  );
}
