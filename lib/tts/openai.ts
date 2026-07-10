import type { SynthesizeResult } from "@/lib/tts/types";

/**
 * 将来、OpenAIの音声合成APIとVOICE_IDを使って本人の声を生成するための差し替え先。
 * 現時点では未接続（MVP範囲外）。
 */
export async function synthesizeOpenAI(text: string): Promise<SynthesizeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const voiceId = process.env.OPENAI_VOICE_ID;

  if (!apiKey || !voiceId) {
    throw new Error(
      "本人の声（OpenAI）はまだ準備中です。しばらくすると使えるようになります。"
    );
  }

  throw new Error(
    `本人の声（OpenAI）による「${text}」の読み上げは、まだこのアプリでは準備中です。`
  );
}
