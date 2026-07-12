export type PhraseCategory = "urgent" | "daily" | "response" | "favorite";

export interface Phrase {
  id: string;
  text: string;
  createdAt: number;
  category: PhraseCategory;
  order: number;
}
