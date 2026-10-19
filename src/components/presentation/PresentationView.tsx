"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSlides } from "@/domain/presentation";
import { standardTemplate } from "@/domain/template";
import type { Slide } from "@/domain/types";
import { useProject } from "@/state/ProjectContext";
import { PresentationRunner } from "./PresentationRunner";
import { SlideEditorDialog } from "./SlideEditorDialog";
import { SlideGrid } from "./SlideGrid";

export function PresentationView() {
  const { state, dispatch } = useProject();
  const [running, setRunning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const project = state.project!; // rendered only when a project is open
  const { slides } = project.presentation;
  // Templates are local files: the choice is Standard or the one open in the Template Designer.
  const active = state.activeTemplate?.id === "standard" ? null : state.activeTemplate;
  const templateId = active?.id === project.presentation.templateId ? active.id : "standard";

  const update = (patch: { templateId?: string; slides?: Slide[] }) =>
    dispatch({ type: "updateProject", patch: { presentation: { ...project.presentation, ...patch } } });

  const generate = () => {
    if (slides.length > 0 && !window.confirm("Replace the existing slides?")) return;
    const template = active && templateId === active.id ? active : standardTemplate(project.table.columns);
    update({ slides: generateSlides(project.table, template) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          Template
          <select
            className="h-8 rounded-lg border bg-background px-2"
            value={templateId}
            onChange={(e) => update({ templateId: e.target.value })}
          >
            <option value="standard">Standard</option>
            {active && <option value={active.id}>{active.name}</option>}
          </select>
        </label>
        <Button onClick={generate}>New Presentation</Button>
        <Button variant="outline" disabled={slides.length === 0} onClick={() => setRunning(true)}>
          Start Presentation
        </Button>
      </div>
      {slides.length === 0 ? (
        <p className="p-4 text-muted-foreground">No presentation yet. Pick a template and click New Presentation.</p>
      ) : (
        <SlideGrid slides={slides} onChange={(s) => update({ slides: s })} onOpen={setEditingId} />
      )}
      <SlideEditorDialog
        slide={slides.find((s) => s.id === editingId) ?? null}
        index={slides.findIndex((s) => s.id === editingId)}
        table={project.table}
        onChange={(slide) => update({ slides: slides.map((s) => (s.id === slide.id ? slide : s)) })}
        onClose={() => setEditingId(null)}
      />
      {running && <PresentationRunner slides={slides} onExit={() => setRunning(false)} />}
    </div>
  );
}
