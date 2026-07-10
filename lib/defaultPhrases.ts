import type { Phrase } from "@/types/phrase";

const baseTexts = [
  "こんにちは",
  "ありがとう",
  "はい",
  "いいえ",
  "そうですね",
  "少し待ってください",
  "もう一度お願いします",
  "水が飲みたいです",
  "トイレに行きたいです",
  "痛いです",
  "大丈夫です",
  "疲れました",
  "うれしいです",
  "今日は調子がいいです",
  "少し休みたいです",
  "よろしくお願いします",
];

export const defaultPhrases: Phrase[] = baseTexts.map((text, index) => ({
  id: `default-${index + 1}`,
  text,
  createdAt: 0,
}));
