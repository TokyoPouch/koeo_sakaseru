"use client";

import type { LucideIcon } from "lucide-react";

interface PhraseCardProps {
  text: string;
  icon: LucideIcon | null;
  isActive: boolean;
  tone?: "neutral" | "response";
  onSpeak: () => void;
}

export function PhraseCard({ text, icon: Icon, isActive, tone = "neutral", onSpeak }: PhraseCardProps) {
  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={`「${text}」を話す`}
      className={`flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-4 text-center shadow-sm transition-all duration-200 active:scale-[0.97] active:opacity-90 ${
        tone === "response" ? "border-aomidori/10 bg-mizu/40" : "border-ink/10 bg-washi"
      } ${isActive ? "scale-[0.98] bg-mizu/60 shadow-inner" : ""}`}
    >
      {Icon ? <Icon aria-hidden="true" className="h-6 w-6 text-ink/70" /> : null}
      <span className="text-sm leading-snug text-ink sm:text-base">{text}</span>
    </button>
  );
}
