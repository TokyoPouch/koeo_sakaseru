"use client";

import { Sparkle, type LucideIcon } from "lucide-react";
import { CategorySection, type CategoryDisplayKind } from "@/components/CategorySection";
import { useCategoryOrder } from "@/lib/storage";
import type { Phrase, PhraseCategory } from "@/types/phrase";

interface CategorizedPhraseListProps {
  phrases: Phrase[];
  activePhraseId: string | null;
  onSpeak: (phrase: Phrase) => void;
}

interface CategoryConfig {
  title: string;
  barColorClassName: string;
  displayKind: CategoryDisplayKind;
  tileColumns?: 2 | 3 | 4;
  tone?: "neutral" | "response";
  headingIcon?: LucideIcon;
}

const CATEGORY_CONFIG: Record<PhraseCategory, CategoryConfig> = {
  urgent: {
    title: "すぐ伝えたい",
    barColorClassName: "bg-aomidori",
    displayKind: "row-stack",
    headingIcon: Sparkle,
  },
  daily: {
    title: "日常",
    barColorClassName: "bg-mizu",
    displayKind: "row-grid-2",
  },
  response: {
    title: "返事",
    barColorClassName: "bg-sky-400",
    displayKind: "tile-grid",
    tileColumns: 4,
    tone: "response",
  },
  favorite: {
    title: "よく使う",
    barColorClassName: "bg-kinari-deep",
    displayKind: "tile-grid",
    tileColumns: 2,
  },
};

function byOrder(a: Phrase, b: Phrase): number {
  return a.order - b.order;
}

export function CategorizedPhraseList({ phrases, activePhraseId, onSpeak }: CategorizedPhraseListProps) {
  const categoryOrder = useCategoryOrder();

  if (phrases.length === 0) {
    return <p className="text-sm text-ink/50">まだ言葉が登録されていません。</p>;
  }

  return (
    <div>
      {categoryOrder.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const grouped = phrases.filter((p) => p.category === category).sort(byOrder);
        return (
          <CategorySection
            key={category}
            title={config.title}
            barColorClassName={config.barColorClassName}
            headingIcon={config.headingIcon}
            displayKind={config.displayKind}
            tileColumns={config.tileColumns}
            tone={config.tone}
            phrases={grouped}
            activePhraseId={activePhraseId}
            onSpeak={onSpeak}
          />
        );
      })}
    </div>
  );
}
