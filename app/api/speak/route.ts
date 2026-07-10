import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/tts";

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

  try {
    const result = await synthesizeSpeech(text.trim());
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "うまく声にできませんでした。少し時間をおいてもう一度お試しください。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
