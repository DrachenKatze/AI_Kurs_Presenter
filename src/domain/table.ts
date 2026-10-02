import type { DataTable, Id } from "./types";

export const addColumn = (t: DataTable, name: string): DataTable => ({
  ...t,
  columns: [...t.columns, { id: crypto.randomUUID(), name }],
});

export const renameColumn = (t: DataTable, id: Id, name: string): DataTable => ({
  ...t,
  columns: t.columns.map((c) => (c.id === id ? { ...c, name } : c)),
});

export const deleteColumn = (t: DataTable, id: Id): DataTable => ({
  columns: t.columns.filter((c) => c.id !== id),
  rows: t.rows.map((r) => ({ ...r, cells: Object.fromEntries(Object.entries(r.cells).filter(([k]) => k !== id)) })),
});

export const addRow = (t: DataTable): DataTable => ({
  ...t,
  rows: [
    ...t.rows,
    { id: crypto.randomUUID(), hidden: false, cells: Object.fromEntries(t.columns.map((c) => [c.id, ""])) },
  ],
});

export const editCell = (t: DataTable, rowId: Id, columnId: Id, value: string): DataTable => ({
  ...t,
  rows: t.rows.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [columnId]: value } } : r)),
});

export const deleteRow = (t: DataTable, rowId: Id): DataTable => ({
  ...t,
  rows: t.rows.filter((r) => r.id !== rowId),
});

const isNum = (s: string) => s.trim() !== "" && !Number.isNaN(Number(s));

export function sortRows(t: DataTable, columnId: Id, dir: "asc" | "desc"): DataTable {
  const sign = dir === "asc" ? 1 : -1;
  const cmp = (a: string, b: string) =>
    isNum(a) && isNum(b) ? Number(a) - Number(b) : a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  const rows = [...t.rows].sort((a, b) => sign * cmp(a.cells[columnId] ?? "", b.cells[columnId] ?? ""));
  return { ...t, rows };
}

export const toggleHidden = (t: DataTable, rowId: Id): DataTable => ({
  ...t,
  rows: t.rows.map((r) => (r.id === rowId ? { ...r, hidden: !r.hidden } : r)),
});
