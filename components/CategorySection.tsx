"use client";

import { PhraseCard } from "@/components/PhraseCard";
import { getPhraseIcon } from "@/lib/phraseIcons";
import type { Phrase } from "@/types/phrase";

interface CategorySectionProps {
  title: string;
  barColorClassName: string;
  columns: 2 | 3 | 4;
  tone?: "neutral" | "response";
  phrases: Phrase[];
  activePhraseId: string | null;
  onSpeak: (phrase: Phrase) => void;
}

const COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function CategorySection({
  title,
  barColorClassName,
  columns,
  tone = "neutral",
  phrases,
  activePhraseId,
  onSpeak,
}: CategorySectionProps) {
  if (phrases.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-base font-medium text-ink/80">
        <span aria-hidden="true" className={`h-4 w-1.5 rounded-full ${barColorClassName}`} />
        {title}
      </h2>
      <div className={`grid gap-3 ${COLUMN_CLASS[columns]}`}>
        {phrases.map((phrase, index) => {
          const isLastOdd = columns === 2 && phrases.length % 2 === 1 && index === phrases.length - 1;
          return (
            <div key={phrase.id} className={isLastOdd ? "col-span-2" : undefined}>
              <PhraseCard
                text={phrase.text}
                icon={getPhraseIcon(phrase.text, phrase.category)}
                isActive={activePhraseId === phrase.id}
                tone={tone}
                onSpeak={() => onSpeak(phrase)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
