"use client";

import { AddElementButtons } from "@/components/canvas/AddElementButtons";
import { BackgroundButton } from "@/components/canvas/BackgroundButton";
import { EditableCanvas } from "@/components/canvas/EditableCanvas";
import { UnusedColumnsSidebar } from "@/components/canvas/UnusedColumnsSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fieldElement, unusedColumns } from "@/domain/template";
import type { DataTable, Slide, SlideElement } from "@/domain/types";

interface Props {
  slide: Slide | null; // null = closed
  index: number;
  table: DataTable;
  onChange: (slide: Slide) => void;
  onClose: () => void;
}

/** Edits one slide snapshot. Changes apply to that slide only, never to the template. */
export function SlideEditorDialog({ slide, index, table, onChange, onClose }: Props) {
  const row = slide && table.rows.find((r) => r.id === slide.rowId);
  const valueOf = (columnName?: string) => {
    const col = table.columns.find((c) => c.name === columnName);
    return (col && row?.cells[col.id]) || "";
  };
  // New field elements show the value of this slide's row instead of a [placeholder].
  const fill = (elements: SlideElement[]) =>
    elements.map((e) => (e.kind === "field" && e.text === undefined ? { ...e, text: valueOf(e.columnName) } : e));
  const setElements = (elements: SlideElement[]) => slide && onChange({ ...slide, elements: fill(elements) });

  return (
    <Dialog open={slide !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit slide {index + 1}</DialogTitle>
        </DialogHeader>
        {slide && (
          <>
            <div className="flex gap-2">
              <AddElementButtons onAdd={(el) => setElements([...slide.elements, el])} />
              <BackgroundButton value={slide.background} onChange={(background) => onChange({ ...slide, background })} />
            </div>
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <EditableCanvas elements={slide.elements} background={slide.background} onChange={setElements} />
              </div>
              <UnusedColumnsSidebar
                columns={unusedColumns(slide, table.columns)}
                onAdd={(name) => setElements([...slide.elements, fieldElement(name, 10, 10)])}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
