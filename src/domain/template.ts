import type { Column, SlideElement, Template } from "./types";

type HasElements = Pick<Template, "elements">; // a template or a slide

const fieldNames = (t: HasElements) =>
  t.elements.flatMap((e) => (e.kind === "field" && e.columnName !== undefined ? [e.columnName] : []));

/** Built-in template: one field per column, stacked vertically. Not stored as a file. */
export function standardTemplate(columns: Column[]): Template {
  const h = columns.length ? Math.min(20, 90 / columns.length) : 20;
  const elements: SlideElement[] = columns.map((c, i) => ({
    id: crypto.randomUUID(),
    kind: "field",
    x: 5,
    y: 5 + i * h,
    w: 90,
    h: h * 0.9,
    columnName: c.name,
    style: { fontSize: 24 },
  }));
  return { version: 1, id: "standard", name: "Standard", elements };
}

/** A field placeholder for a column, with its top-left corner at (x, y) percent, kept inside the slide. */
export function fieldElement(columnName: string, x: number, y: number): SlideElement {
  const w = 40;
  const h = 12;
  return {
    id: crypto.randomUUID(),
    kind: "field",
    x: Math.min(Math.max(x, 0), 100 - w),
    y: Math.min(Math.max(y, 0), 100 - h),
    w,
    h,
    columnName,
    style: { fontSize: 24 },
  };
}

/** Columns that have no placeholder in the template. */
export function unusedColumns(template: HasElements, columns: Column[]): Column[] {
  const used = new Set(fieldNames(template));
  return columns.filter((c) => !used.has(c.name));
}

/** Placeholder names in the template that match no column. */
export function missingColumns(template: HasElements, columns: Column[]): string[] {
  const names = new Set(columns.map((c) => c.name));
  return [...new Set(fieldNames(template))].filter((n) => !names.has(n));
}

export const IMAGE_WARN_BYTES = 2 * 1024 * 1024;

export function textElement(): SlideElement {
  return { id: crypto.randomUUID(), kind: "text", x: 10, y: 10, w: 40, h: 12, text: "Text", style: { fontSize: 24 } };
}

export function imageElement(src: string): SlideElement {
  return { id: crypto.randomUUID(), kind: "image", x: 10, y: 10, w: 30, h: 30, src };
}
