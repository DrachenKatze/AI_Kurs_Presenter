"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject, parseProject } from "@/domain/project";
import { downloadFile, pickFile } from "@/lib/files";
import { useProject } from "@/state/ProjectContext";

export function TopBar() {
  const { state, dispatch } = useProject();
  const [message, setMessage] = useState("");

  // Runs an async action and shows its error (or a success note) in the bar.
  const run = async (action: () => Promise<string | void>) => {
    try {
      setMessage((await action()) ?? "");
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  // Projects are saved to and loaded from .json files on the user's machine.
  const load = async () => {
    const json = await pickFile(".json,application/json");
    if (json !== null) dispatch({ type: "open", project: parseProject(json) });
  };

  const save = async () => {
    const p = state.project!;
    downloadFile(`${p.name || "project"}.json`, JSON.stringify(p), "application/json");
    return "Saved";
  };

  return (
    <header className="flex items-center gap-2 border-b bg-[#6f5993] p-3 text-white">
      <Button onClick={() => dispatch({ type: "open", project: createProject("New Project") })}>New</Button>
      <Button onClick={() => run(load)}>Load</Button>
      <Button disabled={!state.project} onClick={() => run(save)}>
        Save
      </Button>
      {state.project && (
        <Input
          aria-label="Project name"
          className="w-56 bg-white text-foreground"
          value={state.project.name}
          onChange={(e) => dispatch({ type: "updateProject", patch: { name: e.target.value } })}
        />
      )}
      <span role="status" className="text-sm">
        {message}
      </span>
      {/* Server and browser may disagree on "today" (timezone), so skip the hydration warning. */}
      <time suppressHydrationWarning className="ml-auto text-sm">
        {new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
      </time>
      <Button disabled>
        Settings
      </Button>
    </header>
  );
}
