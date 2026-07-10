import type { SynthesizeResult } from "@/lib/tts/types";

export async function synthesizeMock(text: string): Promise<SynthesizeResult> {
  return {
    provider: "mock",
    useBrowserSpeech: false,
    note: `(mock) "${text}" を読み上げる想定です。`,
  };
}
