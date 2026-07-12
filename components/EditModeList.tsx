"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORY_LABEL, CATEGORY_TAG_CLASSNAME } from "@/lib/categoryMeta";
import type { Phrase, PhraseCategory } from "@/types/phrase";

interface EditModeListProps {
  phrases: Phrase[];
  onReorder: (next: Phrase[]) => void;
  onEdit: (id: string, text: string, category: PhraseCategory) => void;
  onDelete: (phrase: Phrase) => void;
  onAdd: (text: string, category: PhraseCategory) => void;
}

interface SortableRowProps {
  phrase: Phrase;
  isEditing: boolean;
  draftText: string;
  draftCategory: PhraseCategory;
  onDraftChange: (value: string) => void;
  onDraftCategoryChange: (value: PhraseCategory) => void;
  onStartEdit: () => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function SortableRow({
  phrase,
  isEditing,
  draftText,
  draftCategory,
  onDraftChange,
  onDraftCategoryChange,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onDelete,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phrase.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded-xl border border-ink/8 bg-washi/70 px-2 py-2 ${
        isDragging ? "shadow-md" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`「${phrase.text}」を並び替える`}
        className="flex h-11 w-11 shrink-0 touch-none items-center justify-center text-ink/40"
      >
        <GripVertical aria-hidden="true" className="h-5 w-5" />
      </button>

      {isEditing ? (
        <div className="flex flex-1 flex-col gap-2 py-1">
          <label htmlFor={`edit-${phrase.id}`} className="sr-only">
            ことばを編集
          </label>
          <textarea
            id={`edit-${phrase.id}`}
            value={draftText}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={2}
            autoFocus
            maxLength={120}
            className="w-full resize-none rounded-xl border border-aomidori/30 bg-white px-3 py-2 text-base text-ink focus:border-aomidori/50 focus:outline-none focus:ring-2 focus:ring-aomidori/20"
          />
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`edit-category-${phrase.id}`} className="sr-only">
              カテゴリを選ぶ
            </label>
            <select
              id={`edit-category-${phrase.id}`}
              value={draftCategory}
              onChange={(e) => onDraftCategoryChange(e.target.value as PhraseCategory)}
              className="rounded-lg border border-ink/10 bg-white px-2 py-2 text-sm text-ink"
            >
              {(Object.keys(CATEGORY_LABEL) as PhraseCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABEL[key]}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button type="button" onClick={onCancelEdit} className="px-2 py-1 text-sm text-ink/50">
                やめる
              </button>
              <button
                type="button"
                onClick={onConfirmEdit}
                disabled={draftText.trim().length === 0}
                className="rounded-lg bg-aomidori px-4 py-1.5 text-sm font-medium text-white disabled:bg-ink/20"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      ) : (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-1 py-0.5">
          <span
            className={`w-fit shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${CATEGORY_TAG_CLASSNAME[phrase.category]}`}
          >
            {CATEGORY_LABEL[phrase.category]}
          </span>
          <span className="truncate text-base text-ink">{phrase.text}</span>
        </span>
      )}

      {!isEditing && (
        <>
          <button
            type="button"
            onClick={onStartEdit}
            aria-label={`「${phrase.text}」を編集`}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-aomidori/70"
          >
            <Pencil aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`「${phrase.text}」を削除`}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-ink/40"
          >
            <Trash2 aria-hidden="true" className="h-5 w-5" />
          </button>
        </>
      )}
    </li>
  );
}

export function EditModeList({ phrases, onReorder, onEdit, onDelete, onAdd }: EditModeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftCategory, setDraftCategory] = useState<PhraseCategory>("daily");
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<PhraseCategory>("daily");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const ordered = [...phrases].sort((a, b) => a.order - b.order);

  const startEdit = (phrase: Phrase) => {
    setEditingId(phrase.id);
    setDraftText(phrase.text);
    setDraftCategory(phrase.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftText("");
  };

  const confirmEdit = () => {
    if (editingId && draftText.trim().length > 0) {
      onEdit(editingId, draftText, draftCategory);
    }
    cancelEdit();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((p) => p.id === active.id);
    const newIndex = ordered.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const moved = arrayMove(ordered, oldIndex, newIndex).map((phrase, index) => ({
      ...phrase,
      order: index,
    }));
    onReorder(moved);
  };

  const submitAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    onAdd(trimmed, newCategory);
    setNewText("");
    setNewCategory("daily");
    setIsAdding(false);
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {ordered.map((phrase) => (
              <SortableRow
                key={phrase.id}
                phrase={phrase}
                isEditing={editingId === phrase.id}
                draftText={draftText}
                draftCategory={draftCategory}
                onDraftChange={setDraftText}
                onDraftCategoryChange={setDraftCategory}
                onStartEdit={() => startEdit(phrase)}
                onConfirmEdit={confirmEdit}
                onCancelEdit={cancelEdit}
                onDelete={() => onDelete(phrase)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {isAdding ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-aomidori/30 bg-white/80 p-3">
          <label htmlFor="new-phrase-text" className="sr-only">
            新しいことば
          </label>
          <textarea
            id="new-phrase-text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            maxLength={120}
            rows={2}
            autoFocus
            placeholder="ことばを入力"
            className="w-full resize-none rounded-xl border border-ink/10 bg-white px-3 py-2 text-base text-ink focus:border-aomidori/50 focus:outline-none focus:ring-2 focus:ring-aomidori/20"
          />
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="new-phrase-category" className="sr-only">
              カテゴリを選ぶ
            </label>
            <select
              id="new-phrase-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as PhraseCategory)}
              className="rounded-lg border border-ink/10 bg-white px-2 py-2 text-sm text-ink"
            >
              {(Object.keys(CATEGORY_LABEL) as PhraseCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABEL[key]}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewText("");
                }}
                className="px-2 py-1 text-sm text-ink/50"
              >
                やめる
              </button>
              <button
                type="button"
                onClick={submitAdd}
                disabled={newText.trim().length === 0}
                className="rounded-lg bg-aomidori px-4 py-1.5 text-sm font-medium text-white disabled:bg-ink/20"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-aomidori/30 py-3 text-sm font-medium text-aomidori"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          ことばを追加
        </button>
      )}
    </div>
  );
}
