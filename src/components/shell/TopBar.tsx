"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createProject } from "@/domain/project";
import { listProjects, loadProject, saveProject, type ListItem } from "@/lib/api";
import { useProject } from "@/state/ProjectContext";

export function TopBar() {
  const { state, dispatch } = useProject();
  const [picker, setPicker] = useState<ListItem[] | null>(null); // null = closed
  const [message, setMessage] = useState("");

  // Runs an async action and shows its error (or a success note) in the bar.
  const run = async (action: () => Promise<string | void>) => {
    try {
      setMessage((await action()) ?? "");
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  return (
    <header className="flex items-center gap-2 border-b p-3">
      <Button onClick={() => dispatch({ type: "open", project: createProject("New Project") })}>New</Button>
      <Button onClick={() => run(async () => setPicker(await listProjects()))}>Load</Button>
      <Button
        disabled={!state.project}
        onClick={() => run(async () => (await saveProject(state.project!), "Saved"))}
      >
        Save
      </Button>
      {state.project && (
        <Input
          aria-label="Project name"
          className="w-56"
          value={state.project.name}
          onChange={(e) => dispatch({ type: "updateProject", patch: { name: e.target.value } })}
        />
      )}
      <span role="status" className="text-sm text-muted-foreground">
        {message}
      </span>
      <Button disabled className="ml-auto">
        Settings
      </Button>

      <Dialog open={picker !== null} onOpenChange={(open) => !open && setPicker(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load project</DialogTitle>
          </DialogHeader>
          {picker?.length === 0 && <p className="text-muted-foreground">No saved projects yet.</p>}
          <ul className="flex flex-col gap-2">
            {picker?.map((p) => (
              <li key={p.id}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    run(async () => {
                      dispatch({ type: "open", project: await loadProject(p.id) });
                      setPicker(null);
                    })
                  }
                >
                  {p.name}
                </Button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
}
