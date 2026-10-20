"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSlides } from "@/domain/presentation";
import { standardTemplate } from "@/domain/template";
import { DEFAULT_TIMER_SECONDS, individualTimers, isTimerVisible, removeTimer, setTimer } from "@/domain/timer";
import type { Slide } from "@/domain/types";
import { useProject } from "@/state/ProjectContext";
import { PresentationRunner } from "./PresentationRunner";
import { SlideEditorDialog } from "./SlideEditorDialog";
import { SlideGrid } from "./SlideGrid";

export function PresentationView() {
  const { state, dispatch } = useProject();
  const [running, setRunning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [timerVisible, setTimerVisible] = useState(false);
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
    // The slides take the template's timer; the shared Seconds/Visible controls follow it
    if (template.timer !== undefined) {
      setSeconds(template.timer);
      setTimerVisible(isTimerVisible(template));
    }
  };

  const hasTimer = slides.some((s) => s.timer !== undefined);

  // Sets every slide; while a timer is set, Seconds and Visible apply directly through this too
  const applyTimer = (sec: number, visible: boolean) => {
    const n = individualTimers(slides, seconds, timerVisible); // slides edited apart from the shared setting
    if (n > 0 && !window.confirm(`${n} slide(s) have their own timer settings. Overwrite them?`)) return;
    setSeconds(sec);
    setTimerVisible(visible);
    update({ slides: slides.map((s) => setTimer(s, sec, visible)) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <b>Template</b>
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
        <Button
          variant="outline"
          disabled={slides.length === 0}
          onClick={() => (hasTimer ? update({ slides: slides.map(removeTimer) }) : applyTimer(seconds, timerVisible))}
        >
          {hasTimer ? "Remove Timer" : "Add Timer"}
        </Button>
        {hasTimer && (
          <>
            <label className="flex items-center gap-2 text-sm">
              Seconds
              <input
                type="number"
                min={1}
                className="h-8 w-16 rounded-lg border bg-background px-2"
                value={seconds}
                onChange={(e) => applyTimer(Math.max(1, Math.round(Number(e.target.value)) || 1), timerVisible)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={timerVisible} onChange={(e) => applyTimer(seconds, e.target.checked)} />
              Visible
            </label>
          </>
        )}
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
