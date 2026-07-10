import {
  PersonStanding,
  Droplet,
  DoorOpen,
  Sun,
  Flower2,
  Handshake,
  Clock,
  Ear,
  Leaf,
  Smile,
  CloudSun,
  Coffee,
  type LucideIcon,
} from "lucide-react";
import type { PhraseCategory } from "@/types/phrase";

const ICON_BY_TEXT: Record<string, LucideIcon> = {
  痛いです: PersonStanding,
  水が飲みたいです: Droplet,
  トイレに行きたいです: DoorOpen,
  こんにちは: Sun,
  ありがとう: Flower2,
  よろしくお願いします: Handshake,
  少し待ってください: Clock,
  もう一度お願いします: Ear,
  疲れました: Leaf,
  うれしいです: Smile,
  今日は調子がいいです: CloudSun,
  少し休みたいです: Coffee,
};

export function getPhraseIcon(text: string, category: PhraseCategory): LucideIcon | null {
  if (category === "response") return null;
  return ICON_BY_TEXT[text] ?? null;
}
