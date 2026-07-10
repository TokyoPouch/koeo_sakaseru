import { getTTSProvider } from "@/lib/voiceConfig";
import type { SynthesizeResult } from "@/lib/tts/types";
import { synthesizeMock } from "@/lib/tts/mock";
import { synthesizeWebSpeech } from "@/lib/tts/webSpeech";
import { synthesizeOpenAI } from "@/lib/tts/openai";
import { synthesizeElevenLabs } from "@/lib/tts/elevenlabs";

export type { SynthesizeResult } from "@/lib/tts/types";

export async function synthesizeSpeech(text: string): Promise<SynthesizeResult> {
  const provider = getTTSProvider();

  switch (provider) {
    case "openai":
      return synthesizeOpenAI(text);
    case "elevenlabs":
      return synthesizeElevenLabs(text);
    case "mock":
      return synthesizeMock(text);
    case "webSpeech":
    default:
      return synthesizeWebSpeech(text);
  }
}
