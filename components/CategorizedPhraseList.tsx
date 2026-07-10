"use client";

import { CategorySection } from "@/components/CategorySection";
import type { Phrase } from "@/types/phrase";

interface CategorizedPhraseListProps {
  phrases: Phrase[];
  activePhraseId: string | null;
  onSpeak: (phrase: Phrase) => void;
}

function byOrder(a: Phrase, b: Phrase): number {
  return a.order - b.order;
}

export function CategorizedPhraseList({ phrases, activePhraseId, onSpeak }: CategorizedPhraseListProps) {
  if (phrases.length === 0) {
    return <p className="text-sm text-ink/50">まだ言葉が登録されていません。</p>;
  }

  const urgent = phrases.filter((p) => p.category === "urgent").sort(byOrder);
  const daily = phrases.filter((p) => p.category === "daily").sort(byOrder);
  const response = phrases.filter((p) => p.category === "response").sort(byOrder);

  return (
    <div>
      <CategorySection
        title="すぐ伝えたい"
        barColorClassName="bg-aomidori"
        columns={3}
        phrases={urgent}
        activePhraseId={activePhraseId}
        onSpeak={onSpeak}
      />
      <CategorySection
        title="日常"
        barColorClassName="bg-mizu"
        columns={2}
        phrases={daily}
        activePhraseId={activePhraseId}
        onSpeak={onSpeak}
      />
      <CategorySection
        title="返事"
        barColorClassName="bg-sky-400"
        columns={4}
        tone="response"
        phrases={response}
        activePhraseId={activePhraseId}
        onSpeak={onSpeak}
      />
    </div>
  );
}
