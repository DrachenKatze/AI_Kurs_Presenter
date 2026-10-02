"use client";

import { Button } from "@/components/ui/button";
import type { Column } from "@/domain/types";
import { COLUMN_MIME } from "./EditableCanvas";

interface Props {
  columns: Column[];
  onAdd: (columnName: string) => void; // click fallback for drag and drop
}

export function UnusedColumnsSidebar({ columns, onAdd }: Props) {
  return (
    <aside aria-label="Unused columns" className="flex w-48 shrink-0 flex-col gap-2">
      <h3 className="text-sm font-medium">Unused columns</h3>
      {columns.length === 0 && <p className="text-sm text-muted-foreground">All columns are on the slide.</p>}
      {columns.map((c) => (
        <Button
          key={c.id}
          variant="outline"
          className="justify-start bg-accent-pink/40"
          draggable
          onDragStart={(ev) => ev.dataTransfer.setData(COLUMN_MIME, c.name)}
          onClick={() => onAdd(c.name)}
        >
          {c.name}
        </Button>
      ))}
    </aside>
  );
}
