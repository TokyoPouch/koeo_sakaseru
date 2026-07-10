import { createHash } from "node:crypto";
import { TTSError, type SynthesizeResult } from "@/lib/tts/types";

const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const DEFAULT_TIMEOUT_MS = 8000;

function voiceCacheKey(voiceId: string, modelId: string): string {
  return createHash("sha256").update(`${voiceId}:${modelId}`).digest("hex").slice(0, 16);
}

/**
 * ElevenLabs Text-to-Speechの実API呼び出し。
 * 使用モデル: eleven_multilingual_v2（自然な感情表現を優先した既定モデル）。
 * 反応速度を優先する場合は環境変数 ELEVENLABS_MODEL_ID を eleven_flash_v2_5 に切り替え可能。
 * eleven_turbo_v2_5 はElevenLabs公式がFlashモデルの使用を推奨しているため使用しない。
 */
export async function synthesizeElevenLabs(text: string): Promise<SynthesizeResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    throw new TTSError("TTS_NOT_CONFIGURED", "本人音声が設定されていません");
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;
  const timeoutMs = Number(process.env.TTS_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({ text, model_id: modelId }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new TTSError("TTS_UPSTREAM_ERROR", "本人の声で再生できませんでした");
    }

    const buffer = await response.arrayBuffer();

    return {
      kind: "audio",
      provider: "elevenlabs",
      buffer,
      contentType: "audio/mpeg",
      cacheHeaders: {
        "X-Voice-Cache-Key": voiceCacheKey(voiceId, modelId),
      },
    };
  } catch (error) {
    if (error instanceof TTSError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new TTSError("TTS_TIMEOUT", "本人の声の生成に時間がかかっています");
    }
    throw new TTSError("TTS_UPSTREAM_ERROR", "本人の声で再生できませんでした");
  } finally {
    clearTimeout(timeoutId);
  }
}
