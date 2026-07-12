"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { CATEGORY_LABEL, CATEGORY_TAG_CLASSNAME } from "@/lib/categoryMeta";
import type { PhraseCategory } from "@/types/phrase";

interface CategoryOrderListProps {
  categoryOrder: PhraseCategory[];
  onReorder: (next: PhraseCategory[]) => void;
}

function SortableCategoryRow({ category }: { category: PhraseCategory }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-xl border border-ink/8 bg-washi/70 px-2 py-2 ${
        isDragging ? "shadow-md" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`「${CATEGORY_LABEL[category]}」の表示順を並び替える`}
        className="flex h-11 w-11 shrink-0 touch-none items-center justify-center text-ink/40"
      >
        <GripVertical aria-hidden="true" className="h-5 w-5" />
      </button>
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${CATEGORY_TAG_CLASSNAME[category]}`}>
        {CATEGORY_LABEL[category]}
      </span>
    </li>
  );
}

export function CategoryOrderList({ categoryOrder, onReorder }: CategoryOrderListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categoryOrder.findIndex((c) => c === active.id);
    const newIndex = categoryOrder.findIndex((c) => c === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(categoryOrder, oldIndex, newIndex));
  };

  return (
    <section className="mb-6">
      <h3 className="mb-2 text-sm font-medium text-ink/60">カテゴリーの順番</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categoryOrder} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {categoryOrder.map((category) => (
              <SortableCategoryRow key={category} category={category} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}
