import type { Phrase, PhraseCategory } from "@/types/phrase";

const seedPhrases: Array<{ text: string; category: PhraseCategory }> = [
  { text: "痛いです", category: "urgent" },
  { text: "水が飲みたいです", category: "urgent" },
  { text: "トイレに行きたいです", category: "urgent" },
  { text: "こんにちは", category: "daily" },
  { text: "ありがとう", category: "daily" },
  { text: "よろしくお願いします", category: "daily" },
  { text: "少し待ってください", category: "daily" },
  { text: "もう一度お願いします", category: "daily" },
  { text: "疲れました", category: "daily" },
  { text: "うれしいです", category: "daily" },
  { text: "今日は調子がいいです", category: "daily" },
  { text: "少し休みたいです", category: "daily" },
  { text: "はい", category: "response" },
  { text: "いいえ", category: "response" },
  { text: "そうですね", category: "response" },
  { text: "大丈夫です", category: "response" },
];

export const defaultPhrases: Phrase[] = seedPhrases.map((seed, index) => ({
  id: `default-${index + 1}`,
  text: seed.text,
  createdAt: 0,
  category: seed.category,
  order: index,
}));
