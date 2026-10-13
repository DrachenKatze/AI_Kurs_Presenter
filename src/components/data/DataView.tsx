"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseMarkdownTable, toMarkdownTable } from "@/domain/markdownTable";
import { addColumn, addRow } from "@/domain/table";
import type { DataTable as Table } from "@/domain/types";
import { downloadFile, pickFile } from "@/lib/files";
import { useProject } from "@/state/ProjectContext";
import { DataTable } from "./DataTable";

export function DataView() {
  const { state, dispatch } = useProject();
  const [error, setError] = useState("");
  const project = state.project!; // rendered only when a project is open
  const table = project.table;
  const setTable = (t: Table) => {
    setError("");
    dispatch({ type: "updateProject", patch: { table: t } });
  };

  const newList = () => {
    if (table.columns.length === 0 || window.confirm("Discard the current list?")) {
      setTable({ columns: [], rows: [] });
    }
  };

  const loadMd = async () => {
    const md = await pickFile(".md,text/markdown");
    if (md === null) return;
    try {
      setTable(parseMarkdownTable(md));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={newList}>New list</Button>
        <Button onClick={loadMd}>Load .md</Button>
        <Button
          disabled={table.columns.length === 0}
          onClick={() => {
            const name = window.prompt("File name", project.name || "list")?.trim();
            if (name) downloadFile(name.endsWith(".md") ? name : `${name}.md`, toMarkdownTable(table), "text/markdown");
          }}
        >
          Save .md
        </Button>
        <span className="mx-2 h-6 border-l" />
        <Button variant="outline" onClick={() => setTable(addColumn(table, `Column ${table.columns.length + 1}`))}>
          Add column
        </Button>
        <Button variant="outline" disabled={table.columns.length === 0} onClick={() => setTable(addRow(table))}>
          Add row
        </Button>
        {error && (
          <span role="alert" className="text-sm text-destructive">
            {error}
          </span>
        )}
      </div>
      <DataTable table={table} onChange={setTable} />
    </div>
  );
}
