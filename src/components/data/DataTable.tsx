"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { moveById } from "@/domain/order";
import { deleteColumn, deleteRow, editCell, renameColumn, sortRows, toggleHidden } from "@/domain/table";
import type { DataTable as Table, Row } from "@/domain/types";
import { cn } from "@/lib/utils";

interface Props {
  table: Table;
  onChange: (table: Table) => void;
}

interface RowProps extends Props {
  row: Row;
  index: number;
}

function RowView({ table, onChange, row, index }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const n = index + 1;
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(row.hidden && "opacity-50", isDragging && "relative z-10 bg-background")}
    >
      <td className="w-8 p-0 text-center">
        <Button variant="ghost" size="sm" className="cursor-grab" {...attributes} {...listeners} aria-label={`Move row ${n}`}>
          ⠿
        </Button>
      </td>
      {table.columns.map((c) => (
        <td key={c.id} className="border p-0">
          <Input
            aria-label={`${c.name} row ${n}`}
            className="rounded-none border-0"
            value={row.cells[c.id] ?? ""}
            onChange={(e) => onChange(editCell(table, row.id, c.id, e.target.value))}
          />
        </td>
      ))}
      <td className="border p-0 text-center">
        <input
          type="checkbox"
          aria-label={`Hide row ${n}`}
          checked={row.hidden}
          onChange={() => onChange(toggleHidden(table, row.id))}
        />
      </td>
      <td className="p-0 text-center">
        <Button variant="ghost" size="sm" aria-label={`Delete row ${n}`} onClick={() => onChange(deleteRow(table, row.id))}>
          ✕
        </Button>
      </td>
    </tr>
  );
}

export function DataTable({ table, onChange }: Props) {
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (table.columns.length === 0) {
    return <p className="p-4 text-muted-foreground">The list has no columns yet. Add a column or load a .md file.</p>;
  }

  // First click sorts ascending, every further click on the same column flips the direction.
  const toggleSort = (id: string) => {
    const dir = sort?.id === id && sort.dir === "asc" ? "desc" : "asc";
    setSort({ id, dir });
    onChange(sortRows(table, id, dir));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    setSort(null); // a manual order replaces the sort
    onChange({ ...table, rows: moveById(table.rows, String(active.id), String(over.id)) });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-8" />
            {table.columns.map((c) => (
              <th key={c.id} className="border bg-tab p-1 text-left">
                <div className="flex items-center">
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
                  <Button variant="ghost" size="sm" aria-label={`Sort ${c.name}`} onClick={() => toggleSort(c.id)}>
                    {sort?.id === c.id ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
                  </Button>
                </div>
              </th>
            ))}
            <th className="border bg-tab p-1 text-xs font-normal">Hide</th>
            <th className="w-10" />
          </tr>
        </thead>
        <SortableContext items={table.rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <tbody>
            {table.rows.map((r, i) => (
              <RowView key={r.id} table={table} onChange={onChange} row={r} index={i} />
            ))}
          </tbody>
        </SortableContext>
      </table>
    </DndContext>
  );
}
