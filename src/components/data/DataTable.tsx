"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteColumn, deleteRow, editCell, renameColumn } from "@/domain/table";
import type { DataTable as Table } from "@/domain/types";

interface Props {
  table: Table;
  onChange: (table: Table) => void;
}

export function DataTable({ table, onChange }: Props) {
  if (table.columns.length === 0) {
    return <p className="p-4 text-muted-foreground">The list has no columns yet. Add a column or load a .md file.</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {table.columns.map((c) => (
            <th key={c.id} className="border bg-tab p-1 text-left">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label={`Column ${c.name}`} />}>
                  {c.name || "(unnamed)"}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      // ponytail: window.prompt is enough for rename; swap for an inline editor if it feels clunky
                      const name = window.prompt("Column name", c.name);
                      if (name !== null) onChange(renameColumn(table, c.id, name.trim()));
                    }}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChange(deleteColumn(table, c.id))}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </th>
          ))}
          <th className="w-10" />
        </tr>
      </thead>
      <tbody>
        {table.rows.map((r, i) => (
          <tr key={r.id}>
            {table.columns.map((c) => (
              <td key={c.id} className="border p-0">
                <Input
                  aria-label={`${c.name} row ${i + 1}`}
                  className="rounded-none border-0"
                  value={r.cells[c.id] ?? ""}
                  onChange={(e) => onChange(editCell(table, r.id, c.id, e.target.value))}
                />
              </td>
            ))}
            <td className="p-0 text-center">
              <Button variant="ghost" size="sm" aria-label={`Delete row ${i + 1}`} onClick={() => onChange(deleteRow(table, r.id))}>
                ✕
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
