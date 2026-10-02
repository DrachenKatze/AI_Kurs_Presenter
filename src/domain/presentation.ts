import type { DataTable, Slide, Template } from "./types";

/** One snapshot slide per visible row; field values are copied in by column name. */
export function generateSlides(table: DataTable, template: Template): Slide[] {
  const colByName = new Map(table.columns.map((c) => [c.name, c.id]));
  return table.rows
    .filter((r) => !r.hidden)
    .map((row) => ({
      id: crypto.randomUUID(),
      rowId: row.id,
      elements: template.elements.map((e) => {
        const copy = { ...e, id: crypto.randomUUID() };
        if (e.kind === "field") {
          const colId = e.columnName === undefined ? undefined : colByName.get(e.columnName);
          copy.text = colId ? (row.cells[colId] ?? "") : "";
        }
        return copy;
      }),
    }));
}

/** Moves the slide `activeId` to the position of `overId` (drag and drop reorder). */
export function moveSlide(slides: Slide[], activeId: string, overId: string): Slide[] {
  const from = slides.findIndex((s) => s.id === activeId);
  const to = slides.findIndex((s) => s.id === overId);
  if (from < 0 || to < 0 || from === to) return slides;
  const next = [...slides];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}
