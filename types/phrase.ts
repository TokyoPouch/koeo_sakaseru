export type PhraseCategory = "urgent" | "daily" | "response";

export interface Phrase {
  id: string;
  text: string;
  createdAt: number;
  category: PhraseCategory;
  order: number;
}
