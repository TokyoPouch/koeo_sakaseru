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
        className={`ripple-ring animate-breathe absolute inset-[-10%] ${
          isSpeaking ? "border-sky-800/35" : "border-aomidori/35"
        }`}
        style={{ borderWidth: 1.5 }}
      />
      <span
        aria-hidden="true"
        className={`ripple-ring animate-ripple absolute inset-[-20%] [animation-delay:0.3s] ${
          isSpeaking ? "border-sky-800/28" : "border-aomidori/28"
        }`}
        style={{ borderWidth: 1.5 }}
      />
      <span
        aria-hidden="true"
        className={`ripple-ring animate-ripple absolute inset-[-32%] [animation-delay:1.6s] ${
          isSpeaking ? "border-sky-800/20" : "border-aomidori/20"
        }`}
        style={{ borderWidth: 1.5 }}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={isSpeaking ? "再生中" : "入力した文章を話す"}
        className={`speak-orb relative flex h-full w-full flex-col items-center justify-center gap-1 text-white transition-all duration-200 active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-40 ${
          isSpeaking ? "speak-orb--playing" : ""
        }`}
      >
        <AudioWaveform aria-hidden="true" className="relative z-10 h-8 w-8 drop-shadow-sm" />
        <span className="relative z-10 text-lg font-medium drop-shadow-sm">
          {isSpeaking ? "再生中…" : "話す"}
        </span>
      </button>
    </div>
  );
}
