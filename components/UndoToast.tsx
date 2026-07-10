"use client";

import { useEffect } from "react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5000;

export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-washi shadow-lg sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="shrink-0 rounded-lg px-2 py-1 font-medium text-mizu underline underline-offset-2"
      >
        元に戻す
      </button>
    </div>
  );
}
