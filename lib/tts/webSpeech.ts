import type { SynthesizeResult } from "@/lib/tts/types";

export async function synthesizeWebSpeech(text: string): Promise<SynthesizeResult> {
  return {
    provider: "webSpeech",
    useBrowserSpeech: true,
    note: `端末のブラウザ音声で「${text}」を読み上げます。`,
  };
}
