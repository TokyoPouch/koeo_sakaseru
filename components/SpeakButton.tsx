"use client";

import { useEffect, useRef, useState } from "react";
import { AudioWaveform } from "lucide-react";

interface SpeakButtonProps {
  isSpeaking: boolean;
  disabled: boolean;
  onClick: () => void;
}

const RIPPLE_DURATION_MS = 1200;

export function SpeakButton({ isSpeaking, disabled, onClick }: SpeakButtonProps) {
  const [isRippling, setIsRippling] = useState(false);
  const rippleTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rippleTimer.current !== null) window.clearTimeout(rippleTimer.current);
    };
  }, []);

  const handleClick = () => {
    if (rippleTimer.current !== null) window.clearTimeout(rippleTimer.current);
    setIsRippling(true);
    rippleTimer.current = window.setTimeout(() => setIsRippling(false), RIPPLE_DURATION_MS);
    onClick();
  };

  return (
    <div className="relative flex aspect-square w-[clamp(4.5rem,18vw,5rem)] items-center justify-center">
      <span
        aria-hidden="true"
        className={`ripple-ring absolute inset-[-16%] ${isRippling ? "animate-ripple-once" : ""} ${
          isSpeaking ? "border-sky-800/35" : "border-aomidori/35"
        }`}
        style={{ borderWidth: 1.5 }}
      />
      <span
        aria-hidden="true"
        className={`ripple-ring absolute inset-[-28%] ${
          isRippling ? "animate-ripple-once [animation-delay:0.18s]" : ""
        } ${isSpeaking ? "border-sky-800/22" : "border-aomidori/22"}`}
        style={{ borderWidth: 1.5 }}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isSpeaking ? "再生中" : "入力した文章を話す"}
        className={`speak-orb relative flex h-full w-full flex-col items-center justify-center gap-0.5 text-white transition-all duration-200 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40 ${
          isSpeaking ? "speak-orb--playing" : ""
        }`}
      >
        <AudioWaveform aria-hidden="true" className="relative z-10 h-5 w-5 drop-shadow-sm" />
        <span className="relative z-10 text-[10px] font-medium leading-none drop-shadow-sm">
          {isSpeaking ? "再生中…" : "話す"}
        </span>
      </button>
    </div>
  );
}
