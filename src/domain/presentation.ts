import type { DataTable, Slide, Template } from "./types";

/** One snapshot slide per visible row; field values are copied in by column name. */
export function generateSlides(table: DataTable, template: Template): Slide[] {
  const colByName = new Map(table.columns.map((c) => [c.name, c.id]));
  return table.rows
    .filter((r) => !r.hidden)
    .map((row) => ({
      id: crypto.randomUUID(),
      rowId: row.id,
      background: template.background,
      timer: template.timer,
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
