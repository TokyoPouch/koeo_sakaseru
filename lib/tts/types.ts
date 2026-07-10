import type { TTSProviderName } from "@/lib/voiceConfig";

export interface SynthesizeResult {
  provider: TTSProviderName;
  /** trueの場合、クライアント側でWeb Speech APIを使って読み上げる */
  useBrowserSpeech: boolean;
  audioUrl?: string;
  note?: string;
}
