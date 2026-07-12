import type { PhraseCategory } from "@/types/phrase";

export const CATEGORY_LABEL: Record<PhraseCategory, string> = {
  urgent: "すぐ伝えたい",
  daily: "日常",
  response: "返事",
  favorite: "よく使う",
};

// 整える画面のカテゴリーラベル（淡い背景 + 濃い文字色でカードを塗りつぶさずに区別する）
export const CATEGORY_TAG_CLASSNAME: Record<PhraseCategory, string> = {
  urgent: "bg-momo/70 text-momo-deep",
  daily: "bg-mizu/70 text-aomidori-deep",
  response: "bg-fuji/70 text-fuji-deep",
  favorite: "bg-kinari/80 text-kinari-deep",
};
