"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from "react";
import { moveElement, resizeElement } from "@/domain/geometry";
import { fieldElement } from "@/domain/template";
import type { SlideElement } from "@/domain/types";
import { cn } from "@/lib/utils";
import { SlideRenderer } from "./SlideRenderer";

export const COLUMN_MIME = "application/x-column";

interface Props {
  elements: SlideElement[];
  onChange: (elements: SlideElement[]) => void;
  /** Column names that no longer exist; their placeholders get a warning marker. */
  missing?: string[];
}

interface Drag {
  mode: "move" | "resize";
  id: string;
  startX: number;
  startY: number;
  orig: SlideElement;
}

/** Select, drag to move, corner-resize and Delete. Dropping a column from the sidebar adds a field. */
export function EditableCanvas({ elements, onChange, missing = [] }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  const patch = (id: string, p: Partial<SlideElement>) =>
    onChange(elements.map((e) => (e.id === id ? { ...e, ...p } : e)));

  const start = (mode: Drag["mode"], e: SlideElement, ev: PointerEvent) => {
    ev.stopPropagation();
    setSelected(e.id);
    box.current?.focus();
    ev.currentTarget.setPointerCapture?.(ev.pointerId); // missing in jsdom
    drag.current = { mode, id: e.id, startX: ev.clientX, startY: ev.clientY, orig: e };
  };

  const move = (ev: PointerEvent) => {
    const d = drag.current;
    const rect = box.current?.getBoundingClientRect();
    if (!d || !rect?.width) return;
    const dx = ((ev.clientX - d.startX) / rect.width) * 100;
    const dy = ((ev.clientY - d.startY) / rect.height) * 100;
    patch(d.id, d.mode === "move" ? moveElement(d.orig, dx, dy) : resizeElement(d.orig, dx, dy));
  };

  const drop = (ev: DragEvent) => {
    const name = ev.dataTransfer.getData(COLUMN_MIME);
    const rect = box.current?.getBoundingClientRect();
    if (!name || !rect?.width) return;
    ev.preventDefault();
    const f = fieldElement(name, ((ev.clientX - rect.left) / rect.width) * 100, ((ev.clientY - rect.top) / rect.height) * 100);
    onChange([...elements, f]);
    setSelected(f.id);
  };

  const keyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Delete" && selected) {
      onChange(elements.filter((e) => e.id !== selected));
      setSelected(null);
    }
  };

  return (
    <SlideRenderer
      ref={box}
      elements={elements}
      tabIndex={0}
      aria-label="Template canvas"
      className="border outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onKeyDown={keyDown}
      onPointerMove={move}
      onPointerUp={() => (drag.current = null)}
      onPointerDown={() => setSelected(null)}
      onDragOver={(ev) => ev.preventDefault()}
      onDrop={drop}
      elementProps={(e) => ({
        "aria-label": `Element ${e.columnName ?? e.kind}`,
        className: cn(
          "cursor-move touch-none",
          e.id === selected ? "outline outline-2 outline-primary-pressed" : "outline outline-1 outline-dashed outline-black/20",
          e.columnName && missing.includes(e.columnName) && "bg-accent-yellow",
        ),
        onPointerDown: (ev) => start("move", e, ev),
        onDoubleClick: () => {
          if (e.kind !== "text") return;
          // ponytail: window.prompt keeps text editing tiny; replace with an inline editor for multi-line text
          const text = window.prompt("Text", e.text ?? "");
          if (text !== null) patch(e.id, { text });
        },
      })}
      overlay={(e) => (
        <>
          {e.columnName && missing.includes(e.columnName) && (
            <span title={`Column "${e.columnName}" not found`} className="absolute -top-2 -left-2 text-xs">
              ⚠
            </span>
          )}
          {e.id === selected && (
            <span
              aria-label="Resize handle"
              className="absolute -right-1.5 -bottom-1.5 size-3 cursor-nwse-resize rounded-sm bg-primary-pressed"
              onPointerDown={(ev) => start("resize", e, ev)}
            />
          )}
        </>
      )}
    />
  );
}
