"use client";

import { useCallback, useRef, useState } from "react";
import { getCachedAudio, putCachedAudio } from "@/lib/audioCache";

export type SpeakerStatus = "idle" | "speaking" | "notice" | "error";

const FALLBACK_ERROR =
  "うまく声にできませんでした。少し時間をおいてもう一度お試しください。";
const FALLBACK_NOTICE =
  "本人の声で再生できなかったため、端末の音声で読み上げます。";
const DUPLICATE_GUARD_MS = 1000;
const NOTICE_DISPLAY_MS = 3000;

function isAbortError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name?: string }).name === "AbortError"
  );
}

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
  const lastRequestRef = useRef<{ key: string; at: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopCurrent = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playBlob = useCallback((blob: Blob): Promise<{ ok: true } | { ok: false }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
      };

      audio.onended = () => {
        cleanup();
        resolve({ ok: true });
      };
      audio.onerror = () => {
        cleanup();
        resolve({ ok: false });
      };

      audio.play().catch(() => {
        cleanup();
        resolve({ ok: false });
      });
    });
  }, []);

  const finishIdle = useCallback(() => {
    setStatus("idle");
  }, []);

  const finishWithNotice = useCallback((message: string) => {
    setStatus("notice");
    setErrorMessage(message);
    window.setTimeout(() => {
      setStatus("idle");
      setErrorMessage(null);
    }, NOTICE_DISPLAY_MS);
  }, []);

  const finishWithError = useCallback((message: string) => {
    setStatus("error");
    setErrorMessage(message);
    window.setTimeout(() => {
      setStatus("idle");
      setErrorMessage(null);
    }, NOTICE_DISPLAY_MS);
  }, []);

  const speak = useCallback(
    async (text: string, requestKey: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const now = Date.now();
      const last = lastRequestRef.current;
      if (last && last.key === requestKey && now - last.at < DUPLICATE_GUARD_MS) {
        return;
      }

      stopCurrent();
      lastRequestRef.current = { key: requestKey, at: now };

      setErrorMessage(null);
      setStatus("speaking");

      const fallbackToBrowser = async (notice: string | null) => {
        const result = await speakWithBrowser(trimmed);
        if (!result.ok) {
          finishWithError(result.message || FALLBACK_ERROR);
          return;
        }
        if (notice) {
          finishWithNotice(notice);
        } else {
          finishIdle();
        }
      };

      try {
        const cached = await getCachedAudio(trimmed);
        if (cached) {
          const played = await playBlob(cached);
          if (played.ok) {
            finishIdle();
          } else {
            await fallbackToBrowser(FALLBACK_NOTICE);
          }
          return;
        }
      } catch {
        // キャッシュ確認に失敗しても通常のリクエストへ進む
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") || "";

        if (response.ok && contentType.includes("audio/mpeg")) {
          const blob = await response.blob();
          void putCachedAudio(
            trimmed,
            blob,
            response.headers.get("X-Voice-Cache-Key")
          ).catch(() => {});

          const played = await playBlob(blob);
          if (played.ok) {
            finishIdle();
          } else {
            await fallbackToBrowser(FALLBACK_NOTICE);
          }
          return;
        }

        const data: unknown = await response.json().catch(() => null);
        const hasErrorSignal =
          data !== null &&
          typeof data === "object" &&
          ("code" in data || "error" in data);
        await fallbackToBrowser(hasErrorSignal ? FALLBACK_NOTICE : null);
      } catch (error) {
        if (isAbortError(error)) return;
        await fallbackToBrowser(FALLBACK_NOTICE);
      }
    },
    [stopCurrent, playBlob, finishIdle, finishWithNotice, finishWithError]
  );

  return { speak, status, errorMessage };
}
