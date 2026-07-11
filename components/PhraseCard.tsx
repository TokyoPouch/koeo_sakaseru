"use client";

import type { LucideIcon } from "lucide-react";

interface PhraseCardProps {
  text: string;
  icon: LucideIcon | null;
  isActive: boolean;
  tone?: "neutral" | "response";
  variant?: "a" | "b" | "c";
  isUrgent?: boolean;
  onSpeak: () => void;
}

export function PhraseCard({
  text,
  icon: Icon,
  isActive,
  tone = "neutral",
  variant = "a",
  isUrgent = false,
  onSpeak,
}: PhraseCardProps) {
  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={`「${text}」を話す`}
      className={`phrase-card flex min-h-[96px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl px-3 py-5 text-center transition-all duration-200 active:scale-[0.97] active:opacity-90 ${
        tone === "response" ? "phrase-card--b" : `phrase-card--${variant}`
      } ${isUrgent ? "phrase-card--urgent" : ""} ${isActive ? "scale-[0.98] shadow-inner" : ""}`}
    >
      {Icon ? <Icon aria-hidden="true" strokeWidth={1.5} className="relative z-10 h-6 w-6 text-ink/60" /> : null}
      <span className="relative z-10 text-sm leading-snug text-ink sm:text-base">{text}</span>
    </button>
  );
}
