"use client";

import { AudioWaveform } from "lucide-react";

interface SpeakButtonProps {
  isSpeaking: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function SpeakButton({ isSpeaking, disabled, onClick }: SpeakButtonProps) {
  return (
    <div className="relative flex aspect-square w-[clamp(9rem,35vw,13rem)] items-center justify-center">
      <span
        aria-hidden="true"
        className="animate-breathe absolute inset-[-14%] rounded-full border border-aomidori/15"
      />
      <span
        aria-hidden="true"
        className="animate-breathe [animation-delay:1s] absolute inset-[-28%] rounded-full border border-aomidori/10"
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={isSpeaking ? "再生中" : "入力した文章を話す"}
        className={`relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-full text-white shadow-md transition-all duration-200 active:translate-y-[2px] active:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${
          isSpeaking
            ? "bg-gradient-to-br from-sky-600 to-sky-800"
            : "bg-gradient-to-br from-aomidori to-aomidori/70"
        }`}
      >
        <AudioWaveform aria-hidden="true" className="h-8 w-8" />
        <span className="text-lg font-medium">{isSpeaking ? "再生中…" : "話す"}</span>
      </button>
    </div>
  );
}
