import { parseMarkdownTable, toMarkdownTable } from "./markdownTable";
import { moveById } from "./order";
import { generateSlides } from "./presentation";
import { createProject, parseProject, parseTemplate } from "./project";
import { addColumn, addRow, deleteColumn, deleteRow, editCell, renameColumn, sortRows, toggleHidden } from "./table";
import { missingColumns, standardTemplate, unusedColumns } from "./template";
import type { DataTable } from "./types";

const names = (t: DataTable) => t.columns.map((c) => c.name);
const col = (t: DataTable, name: string) => t.columns.find((c) => c.name === name)!.id;
const values = (t: DataTable, name: string) => t.rows.map((r) => r.cells[col(t, name)]);

describe("project", () => {
  test("createProject → JSON → parseProject round-trips", () => {
    const p = createProject("Demo");
    expect(parseProject(JSON.stringify(p))).toEqual(p);
  });

  test("rejects invalid JSON, wrong version and missing fields", () => {
    expect(() => parseProject("{nope")).toThrow(/not valid JSON/);
    expect(() => parseProject("[]")).toThrow(/expected an object/);
    expect(() => parseProject(JSON.stringify({ ...createProject("x"), version: 2 }))).toThrow(/version: 2/);
    expect(() => parseProject(JSON.stringify({ version: 1, id: "a", name: "b" }))).toThrow(/"table"/);
    expect(() => parseTemplate(JSON.stringify({ version: 1, id: "a", name: "b" }))).toThrow(/"elements"/);
  });

  test("parseTemplate accepts a valid template", () => {
    const t = standardTemplate([]);
    expect(parseTemplate(JSON.stringify(t))).toEqual(t);
  });
});

describe("markdownTable", () => {
  const md = "| Name | Note |\n| --- | --- |\n| Ann | a \\| b |\n| Bob |\n";

  test("parses escaped pipes and pads uneven rows", () => {
    const t = parseMarkdownTable(md);
    expect(names(t)).toEqual(["Name", "Note"]);
    expect(values(t, "Note")).toEqual(["a | b", ""]);
  });

  test("ignores text around the table and extra cells", () => {
    const t = parseMarkdownTable("# Title\n\nName | Age\n:-- | --:\nAnn | 3 | extra\n\nfooter");
    expect(names(t)).toEqual(["Name", "Age"]);
    expect(t.rows).toHaveLength(1);
    expect(values(t, "Age")).toEqual(["3"]);
  });

  test("round-trip keeps names and values", () => {
    const once = parseMarkdownTable(md);
    const twice = parseMarkdownTable(toMarkdownTable(once));
    expect(names(twice)).toEqual(names(once));
    expect(values(twice, "Note")).toEqual(values(once, "Note"));
    expect(toMarkdownTable(twice)).toBe(toMarkdownTable(once));
  });

  test("throws when there is no table", () => {
    expect(() => parseMarkdownTable("just text\nno table")).toThrow(/No Markdown table/);
  });
});

describe("table", () => {
  const base = () => {
    let t: DataTable = { columns: [], rows: [] };
    t = addColumn(addColumn(t, "A"), "B");
    t = addRow(addRow(addRow(t)));
    return t;
  };

  test("add rows get an empty cell per column; edit and delete row", () => {
    let t = base();
    expect(Object.keys(t.rows[0].cells)).toHaveLength(2);
    t = editCell(t, t.rows[0].id, col(t, "A"), "x");
    expect(values(t, "A")[0]).toBe("x");
    t = deleteRow(t, t.rows[0].id);
    expect(t.rows).toHaveLength(2);
  });

  test("rename keeps the id; delete removes the column and its cells", () => {
    let t = base();
    const id = col(t, "A");
    t = renameColumn(t, id, "Z");
    expect(col(t, "Z")).toBe(id);
    t = deleteColumn(t, id);
    expect(names(t)).toEqual(["B"]);
    expect(t.rows.every((r) => !(id in r.cells))).toBe(true);
  });

  test("sortRows is numeric-aware and does not mutate", () => {
    let t = base();
    ["10", "9", "100"].forEach((v, i) => (t = editCell(t, t.rows[i].id, col(t, "A"), v)));
    const before = values(t, "A");
    expect(values(sortRows(t, col(t, "A"), "asc"), "A")).toEqual(["9", "10", "100"]);
    expect(values(sortRows(t, col(t, "A"), "desc"), "A")).toEqual(["100", "10", "9"]);
    expect(values(t, "A")).toEqual(before);
  });

  test("sortRows falls back to text compare", () => {
    let t = base();
    ["b", "A", "c"].forEach((v, i) => (t = editCell(t, t.rows[i].id, col(t, "A"), v)));
    expect(values(sortRows(t, col(t, "A"), "asc"), "A")).toEqual(["A", "b", "c"]);
  });
});

describe("template + presentation", () => {
  const table = parseMarkdownTable("| Title | Body |\n|---|---|\n| One | first |\n| Two | second |\n| Three | third |");

  test("standardTemplate has one field per column; used/unused/missing by name", () => {
    const tpl = standardTemplate(table.columns);
    expect(tpl.elements.map((e) => e.columnName)).toEqual(["Title", "Body"]);
    expect(unusedColumns(tpl, table.columns)).toEqual([]);

    tpl.elements.pop();
    expect(unusedColumns(tpl, table.columns).map((c) => c.name)).toEqual(["Body"]);

    const other = addColumn({ columns: [], rows: [] }, "Title").columns;
    expect(missingColumns(standardTemplate(table.columns), other)).toEqual(["Body"]);
  });

  test("generateSlides: one per visible row, values by name, new ids", () => {
    table.rows[1].hidden = true;
    const tpl = standardTemplate(table.columns);
    const slides = generateSlides(table, tpl);
    expect(slides).toHaveLength(2);
    expect(slides.map((s) => s.elements[0].text)).toEqual(["One", "Three"]);
    expect(slides[0].elements[0].id).not.toBe(tpl.elements[0].id);
    expect(slides[0].elements[0].id).not.toBe(slides[1].elements[0].id);
  });

  test("generateSlides: missing column gives empty text", () => {
    const tpl = standardTemplate([...table.columns, { id: "x", name: "Ghost" }]);
    expect(generateSlides(table, tpl)[0].elements[2].text).toBe("");
  });
});

describe("row order and visibility", () => {
  const rows = ["a", "b", "c"].map((id) => ({ id, hidden: false, cells: {} }));

  test("moveById reorders and ignores unknown ids", () => {
    expect(moveById(rows, "a", "c").map((r) => r.id)).toEqual(["b", "c", "a"]);
    expect(moveById(rows, "c", "a").map((r) => r.id)).toEqual(["c", "a", "b"]);
    expect(moveById(rows, "a", "x")).toBe(rows);
  });

  test("toggleHidden flips one row, hidden rows get no slide", () => {
    const t = toggleHidden({ columns: [{ id: "c", name: "T" }], rows }, "b");
    expect(t.rows.map((r) => r.hidden)).toEqual([false, true, false]);
    expect(generateSlides(t, standardTemplate(t.columns)).map((s) => s.rowId)).toEqual(["a", "c"]);
    expect(toggleHidden(t, "b").rows[1].hidden).toBe(false);
  });
});
