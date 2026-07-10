import type { SynthesizeResult } from "@/lib/tts/types";

export async function synthesizeWebSpeech(): Promise<SynthesizeResult> {
  return {
    kind: "browserFallback",
    provider: "webSpeech",
  };
}
