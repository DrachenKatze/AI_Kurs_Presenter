"use client";

import { useState } from "react";
import { ListDialog } from "@/components/shell/ListDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldElement, missingColumns, unusedColumns } from "@/domain/template";
import type { Template } from "@/domain/types";
import { listTemplates, loadTemplate, saveTemplate, type ListItem } from "@/lib/api";
import { useProject } from "@/state/ProjectContext";
import { AddElementButtons } from "./AddElementButtons";
import { EditableCanvas } from "./EditableCanvas";
import { UnusedColumnsSidebar } from "./UnusedColumnsSidebar";

const fork = (t: Template): Template => (t.id === "standard" ? { ...t, id: crypto.randomUUID(), name: "My template" } : t);

export function TemplateDesigner() {
  const { state, dispatch } = useProject();
  const [picker, setPicker] = useState<ListItem[] | null>(null);
  const [message, setMessage] = useState("");
  const columns = state.project!.table.columns; // rendered only when a project is open
  const template = state.activeTemplate!;
  const missing = missingColumns(template, columns);

  const setTemplate = (t: Template) => dispatch({ type: "setActiveTemplate", template: t });
  // Any edit turns the built-in Standard Template into a template of its own (it can't be overwritten).
  const edit = (patch: Partial<Template>) => setTemplate({ ...fork(template), ...patch });

  const run = async (action: () => Promise<string | void>) => {
    try {
      setMessage((await action()) ?? "");
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const save = () =>
    run(async () => {
      const t = fork(template);
      setTemplate(t);
      await saveTemplate(t);
      return "Template saved";
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setTemplate({ version: 1, id: crypto.randomUUID(), name: "New template", elements: [] })}>
          New template
        </Button>
        <Button onClick={() => run(async () => setPicker(await listTemplates()))}>Load template</Button>
        <Button onClick={save}>Save template</Button>
        <AddElementButtons onAdd={(el) => edit({ elements: [...template.elements, el] })} />
        <Input
          aria-label="Template name"
          className="w-56"
          value={template.name}
          onChange={(e) => edit({ name: e.target.value })}
        />
        <span role="status" className="text-sm text-muted-foreground">
          {message}
        </span>
      </div>
      {missing.length > 0 && (
        <p role="alert" className="text-sm">
          ⚠ Columns not in this project: {missing.join(", ")}
        </p>
      )}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <EditableCanvas elements={template.elements} missing={missing} onChange={(elements) => edit({ elements })} />
        </div>
        <UnusedColumnsSidebar
          columns={unusedColumns(template, columns)}
          onAdd={(name) => edit({ elements: [...template.elements, fieldElement(name, 10, 10)] })}
        />
      </div>
      <ListDialog
        title="Load template"
        items={picker}
        onClose={() => setPicker(null)}
        onPick={(id) =>
          run(async () => {
            setTemplate(await loadTemplate(id));
            setPicker(null);
          })
        }
      />
    </div>
  );
}
