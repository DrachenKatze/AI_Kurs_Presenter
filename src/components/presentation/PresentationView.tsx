"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSlides } from "@/domain/presentation";
import { standardTemplate } from "@/domain/template";
import type { Slide } from "@/domain/types";
import { listTemplates, loadTemplate, type ListItem } from "@/lib/api";
import { useProject } from "@/state/ProjectContext";
import { PresentationRunner } from "./PresentationRunner";
import { SlideEditorDialog } from "./SlideEditorDialog";
import { SlideGrid } from "./SlideGrid";

export function PresentationView() {
  const { state, dispatch } = useProject();
  const [templates, setTemplates] = useState<ListItem[]>([]);
  const [running, setRunning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const project = state.project!; // rendered only when a project is open
  const { templateId, slides } = project.presentation;

  useEffect(() => {
    listTemplates().then(setTemplates, (e: Error) => setMessage(e.message));
  }, []);

  const update = (patch: { templateId?: string; slides?: Slide[] }) =>
    dispatch({ type: "updateProject", patch: { presentation: { ...project.presentation, ...patch } } });

  const generate = async () => {
    if (slides.length > 0 && !window.confirm("Replace the existing slides?")) return;
    try {
      const template = templateId === "standard" ? standardTemplate(project.table.columns) : await loadTemplate(templateId);
      update({ slides: generateSlides(project.table, template) });
      setMessage("");
    } catch (e) {
      setMessage((e as Error).message);
    }
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
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={generate}>New Presentation</Button>
        <Button variant="outline" disabled={slides.length === 0} onClick={() => setRunning(true)}>
          Start Presentation
        </Button>
        {message && (
          <span role="alert" className="text-sm text-destructive">
            {message}
          </span>
        )}
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
