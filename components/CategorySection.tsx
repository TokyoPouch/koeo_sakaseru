"use client";

import type { LucideIcon } from "lucide-react";
import { PhraseCard } from "@/components/PhraseCard";
import { getPhraseIcon } from "@/lib/phraseIcons";
import type { Phrase } from "@/types/phrase";

export type CategoryDisplayKind = "row-stack" | "row-grid-2" | "tile-grid";

interface CategorySectionProps {
  title: string;
  barColorClassName: string;
  headingIcon?: LucideIcon;
  displayKind: CategoryDisplayKind;
  tileColumns?: 2 | 3 | 4;
  tone?: "neutral" | "response";
  phrases: Phrase[];
  activePhraseId: string | null;
  onSpeak: (phrase: Phrase) => void;
}

const TILE_COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const VARIANT_CYCLE: Array<"a" | "b" | "c"> = ["a", "b", "c"];

export function CategorySection({
  title,
  barColorClassName,
  headingIcon: HeadingIcon,
  displayKind,
  tileColumns = 3,
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
        {HeadingIcon ? (
          <HeadingIcon aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-ink/45" />
        ) : null}
        {title}
      </h2>

      {displayKind === "row-stack" && (
        <div className="flex flex-col gap-2">
          {phrases.map((phrase, index) => (
            <PhraseCard
              key={phrase.id}
              text={phrase.text}
              icon={getPhraseIcon(phrase.text, phrase.category)}
              isActive={activePhraseId === phrase.id}
              variant={VARIANT_CYCLE[index % VARIANT_CYCLE.length]}
              isUrgent={phrase.category === "urgent"}
              layout="row"
              rowSizeClassName="h-[50px] px-4"
              onSpeak={() => onSpeak(phrase)}
            />
          ))}
        </div>
      )}

      {displayKind === "row-grid-2" && (
        <div className="grid grid-cols-2 gap-2">
          {phrases.map((phrase, index) => (
            <PhraseCard
              key={phrase.id}
              text={phrase.text}
              icon={null}
              isActive={activePhraseId === phrase.id}
              variant={VARIANT_CYCLE[index % VARIANT_CYCLE.length]}
              layout="row"
              rowSizeClassName="h-[45px] px-3"
              onSpeak={() => onSpeak(phrase)}
            />
          ))}
        </div>
      )}

      {displayKind === "tile-grid" && (
        <div className={`grid gap-3 ${TILE_COLUMN_CLASS[tileColumns]}`}>
          {phrases.map((phrase, index) => {
            const isLastOdd = tileColumns === 2 && phrases.length % 2 === 1 && index === phrases.length - 1;
            return (
              <div key={phrase.id} className={isLastOdd ? "col-span-2" : undefined}>
                <PhraseCard
                  text={phrase.text}
                  icon={getPhraseIcon(phrase.text, phrase.category)}
                  isActive={activePhraseId === phrase.id}
                  tone={tone}
                  variant={VARIANT_CYCLE[index % VARIANT_CYCLE.length]}
                  onSpeak={() => onSpeak(phrase)}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
