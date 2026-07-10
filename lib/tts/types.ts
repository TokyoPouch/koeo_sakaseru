import type { TTSProviderName } from "@/lib/voiceConfig";

export type TTSErrorCode = "TTS_NOT_CONFIGURED" | "TTS_TIMEOUT" | "TTS_UPSTREAM_ERROR";

export class TTSError extends Error {
  code: TTSErrorCode;

  constructor(code: TTSErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export type SynthesizeResult =
  | {
      kind: "audio";
      provider: TTSProviderName;
      buffer: ArrayBuffer;
      contentType: string;
      cacheHeaders?: Record<string, string>;
    }
  | {
      kind: "browserFallback";
      provider: TTSProviderName;
      /** trueの場合、クライアント側でWeb Speech APIを使って読み上げる */
      note?: string;
    };
