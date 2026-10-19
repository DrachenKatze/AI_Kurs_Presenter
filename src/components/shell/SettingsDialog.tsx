"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  canPickFolder,
  chooseSaveFolder,
  clearSaveFolder,
  createPresetFolders,
  getSaveFolder,
  PRESET_KEY,
  usesPresetFolders,
} from "@/lib/files";

// Colors per scheme live in globals.css ([data-theme=...]); Night Fox is the :root default.
const THEMES = { "night-fox": "Night Fox", "green-woods": "Green Woods", classic: "Classic", historical: "Historical" };
const THEME_KEY = "presenter:theme"; // also read by the inline script in layout.tsx

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("night-fox");
  const [folder, setFolder] = useState<string | null>(null);
  const [preset, setPreset] = useState(false);

  const show = () => {
    setTheme(document.documentElement.dataset.theme || "night-fox");
    getSaveFolder().then((dir) => setFolder(dir?.name ?? null));
    setPreset(usesPresetFolders());
    setOpen(true);
  };

  const pickPreset = (on: boolean) => {
    setPreset(on);
    try {
      localStorage.setItem(PRESET_KEY, on ? "1" : "0");
    } catch {}
    if (on && folder) createPresetFolders().catch(() => {}); // they are created on the next save anyway
  };

  const pickTheme = (t: string) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
  };

  return (
    <>
      <Button onClick={show}>Settings</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <label className="flex flex-col gap-1 text-sm">
            Design
            <select
              className="h-8 rounded-lg border px-2"
              value={theme}
              onChange={(e) => pickTheme(e.target.value)}
            >
              {Object.entries(THEMES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1 text-sm">
            Save folder
            <span className="text-muted-foreground">{folder ?? "None: files are downloaded"}</span>
            {canPickFolder() ? (
              <div className="flex gap-2">
                <Button onClick={async () => setFolder((await chooseSaveFolder()) ?? folder)}>Choose folder</Button>
                {folder && (
                  <Button variant="outline" onClick={() => clearSaveFolder().then(() => setFolder(null))}>
                    Clear
                  </Button>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">This browser cannot choose a folder (use Chrome or Edge).</span>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={preset} onChange={(e) => pickPreset(e.target.checked)} />
            Use preset folders (Project, Table, Templates inside the save folder)
          </label>
        </DialogContent>
      </Dialog>
    </>
  );
}
