"use client";

import { useCallback, useState } from "react";

export type SpeakerStatus = "idle" | "speaking" | "error";

const FALLBACK_ERROR =
  "うまく声にできませんでした。少し時間をおいてもう一度お試しください。";

function speakWithBrowser(text: string): Promise<{ ok: true } | { ok: false; message: string }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve({
        ok: false,
        message: "お使いの端末では読み上げがまだ使えないようです。",
      });
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.95;

    utterance.onend = () => resolve({ ok: true });
    utterance.onerror = () =>
      resolve({ ok: false, message: "もう一度お試しください。" });

    window.speechSynthesis.speak(utterance);
  });
}

export function useTextSpeaker() {
  const [status, setStatus] = useState<SpeakerStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const speak = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    setStatus("speaking");

    try {
      const response = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : FALLBACK_ERROR);
      }

      if (data.useBrowserSpeech) {
        const result = await speakWithBrowser(trimmed);
        if (!result.ok) {
          throw new Error(result.message);
        }
      }

      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : FALLBACK_ERROR);
      window.setTimeout(() => {
        setStatus("idle");
        setErrorMessage(null);
      }, 3000);
    }
  }, []);

  return { speak, status, errorMessage };
}
