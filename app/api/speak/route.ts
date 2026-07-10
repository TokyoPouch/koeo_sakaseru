import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/tts";
import { TTSError, type TTSErrorCode } from "@/lib/tts/types";

const MAX_TEXT_LENGTH = 120;
const FALLBACK_MESSAGE =
  "本人の声で再生できなかったため、端末の音声で読み上げます。";

function statusForCode(code: TTSErrorCode): number {
  switch (code) {
    case "TTS_NOT_CONFIGURED":
      return 503;
    case "TTS_TIMEOUT":
      return 504;
    case "TTS_UPSTREAM_ERROR":
    default:
      return 502;
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "うまく届きませんでした。もう一度お試しください。" },
      { status: 400 }
    );
  }

  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "読み上げることばが見つかりませんでした。" },
      { status: 400 }
    );
  }

  const trimmed = text.trim();

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "文章が長すぎます。120文字以内でお試しください。" },
      { status: 400 }
    );
  }

  try {
    const result = await synthesizeSpeech(trimmed);

    if (result.kind === "audio") {
      return new NextResponse(result.buffer, {
        status: 200,
        headers: {
          "Content-Type": result.contentType,
          "Cache-Control": "no-store",
          ...result.cacheHeaders,
        },
      });
    }

    return NextResponse.json({ useBrowserSpeech: true, note: result.note });
  } catch (error) {
    if (error instanceof TTSError) {
      console.error(`[speak] TTS error: ${error.code}`);
      return NextResponse.json(
        { code: error.code, message: error.message, useBrowserSpeech: true },
        { status: statusForCode(error.code) }
      );
    }

    console.error("[speak] unexpected TTS error");
    return NextResponse.json(
      { error: FALLBACK_MESSAGE, useBrowserSpeech: true },
      { status: 502 }
    );
  }
}
