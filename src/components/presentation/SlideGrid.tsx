"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SlideRenderer } from "@/components/canvas/SlideRenderer";
import { moveById } from "@/domain/order";
import type { Slide } from "@/domain/types";

function Thumbnail({ slide, index, onOpen }: { slide: Slide; index: number; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Slide ${index + 1}`}
      onDoubleClick={onOpen}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`cursor-grab rounded border-2 border-tab bg-tab p-1 ${isDragging ? "z-10 opacity-60" : ""}`}
    >
      <SlideRenderer elements={slide.elements} />
      <div className="pt-1 text-center text-xs">{index + 1}</div>
    </div>
  );
}

/** Thumbnails of all slides; drag (or Space + arrow keys) to reorder, double-click to edit. */
export function SlideGrid({ slides, onChange, onOpen }: { slides: Slide[]; onChange: (slides: Slide[]) => void; onOpen: (id: string) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // a plain click is not a drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) onChange(moveById(slides, String(active.id), String(over.id)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={slides.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {slides.map((s, i) => (
            <Thumbnail key={s.id} slide={s} index={i} onOpen={() => onOpen(s.id)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
