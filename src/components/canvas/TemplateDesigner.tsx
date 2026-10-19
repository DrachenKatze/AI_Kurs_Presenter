"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { parseTemplate } from "@/domain/project";
import { fieldElement, missingColumns, unusedColumns } from "@/domain/template";
import type { Template } from "@/domain/types";
import { fileExists, pickFile, saveFile } from "@/lib/files";
import { useProject } from "@/state/ProjectContext";
import { AddElementButtons } from "./AddElementButtons";
import { BackgroundButton } from "./BackgroundButton";
import { EditableCanvas } from "./EditableCanvas";
import { UnusedColumnsSidebar } from "./UnusedColumnsSidebar";

const fork = (t: Template): Template => (t.id === "standard" ? { ...t, id: crypto.randomUUID(), name: "My template" } : t);
// Templates are saved as local files; the suffix keeps them apart from project .json files in the same folder.
const fileName = (t: Template) => `${t.name}.template.json`;

export function TemplateDesigner() {
  const { state, dispatch } = useProject();
  const [message, setMessage] = useState("");
  // Open save dialog; `clash` means a file with this name already exists and we ask before overwriting it.
  const [dialog, setDialog] = useState<{ name: string; clash?: boolean } | null>(null);
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

  const store = (t: Template) => {
    if (!t.name) throw new Error("Give the template a name first");
    setDialog(null);
    setTemplate(t);
    return saveFile(fileName(t), JSON.stringify(t), "application/json", "Templates");
  };

  // Save template asks for a file name and asks again before replacing an existing file.
  const saveAs = (name: string) =>
    run(async () => {
      const t = { ...fork(template), id: crypto.randomUUID(), name: name.trim() };
      if (await fileExists(fileName(t), "Templates")) return setDialog({ name: t.name, clash: true });
      return store(t);
    });

  const load = async () => {
    const json = await pickFile(".json,application/json");
    if (json !== null) setTemplate(parseTemplate(json));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setTemplate({ version: 1, id: crypto.randomUUID(), name: "New template", elements: [] })}>
          New template
        </Button>
        <Button onClick={() => run(load)}>Load template</Button>
        <Button onClick={() => setDialog({ name: template.name })}>Save template</Button>
        <AddElementButtons onAdd={(el) => edit({ elements: [...template.elements, el] })} />
        <BackgroundButton value={template.background} onChange={(background) => edit({ background })} />
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
          <EditableCanvas elements={template.elements} background={template.background} missing={missing} onChange={(elements) => edit({ elements })} />
        </div>
        <UnusedColumnsSidebar
          columns={unusedColumns(template, columns)}
          onAdd={(name) => edit({ elements: [...template.elements, fieldElement(name, 10, 10)] })}
        />
      </div>
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.clash ? "Overwrite template?" : "Save template as"}</DialogTitle>
          </DialogHeader>
          {dialog?.clash ? (
            <>
              <p>A template named &quot;{dialog.name}&quot; already exists. Do you want to overwrite it?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  No
                </Button>
                <Button
                  onClick={() => run(async () => store({ ...fork(template), id: crypto.randomUUID(), name: dialog.name }))}
                >
                  Yes
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveAs(dialog!.name);
              }}
            >
              <Input
                aria-label="New template name"
                value={dialog?.name ?? ""}
                onChange={(e) => setDialog({ name: e.target.value })}
              />
              <DialogFooter>
                <Button type="submit" disabled={!dialog?.name.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
