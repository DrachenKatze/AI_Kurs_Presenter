import type { DataTable } from "./types";

// Split a "| a | b |" line into cells; `\|` is a literal pipe.
function splitRow(line: string): string[] {
  const t = line.trim();
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "\\" && t[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (t[i] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else cur += t[i];
  }
  cells.push(cur.trim());
  // a leading pipe yields an empty first cell, a trailing pipe an empty last one
  if (t.startsWith("|")) cells.shift();
  if (t.endsWith("|") && !t.endsWith("\\|")) cells.pop();
  return cells;
}

const isSeparator = (cells: string[]) => cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));

/** Parses the first Markdown table in `md`. Short rows are padded, extra cells dropped. */
export function parseMarkdownTable(md: string): DataTable {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l, i) => l.includes("|") && i + 1 < lines.length && isSeparator(splitRow(lines[i + 1])));
  if (start < 0) throw new Error("No Markdown table found");

  const columns = splitRow(lines[start]).map((name) => ({ id: crypto.randomUUID(), name }));
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].includes("|"); i++) {
    const values = splitRow(lines[i]);
    const cells = Object.fromEntries(columns.map((c, j) => [c.id, values[j] ?? ""]));
    rows.push({ id: crypto.randomUUID(), hidden: false, cells });
  }
  return { columns, rows };
}

const esc = (s: string) => s.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");

export function toMarkdownTable(table: DataTable): string {
  if (table.columns.length === 0) return "";
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const body = [
    line(table.columns.map((c) => esc(c.name))),
    line(table.columns.map(() => "---")),
    ...table.rows.map((r) => line(table.columns.map((c) => esc(r.cells[c.id] ?? "")))),
  ];
  return body.join("\n") + "\n";
}
