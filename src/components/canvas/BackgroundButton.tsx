"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Background } from "@/domain/types";
import { pickCheckedImage } from "./AddElementButtons";
import { SlideRenderer } from "./SlideRenderer";

const DIRECTIONS = [
  { label: "Left to right", angle: 90 },
  { label: "Right to left", angle: 270 },
  { label: "Top to bottom", angle: 180 },
  { label: "Bottom to top", angle: 0 },
  { label: "Diagonal ↘", angle: 135 },
  { label: "Diagonal ↗", angle: 45 },
];

const KINDS = [
  { kind: "color", label: "Color" },
  { kind: "gradient", label: "Gradient" },
  { kind: "image", label: "Picture" },
] as const;

interface Props {
  value?: Background;
  onChange: (bg: Background | undefined) => void;
}

/** "Add background" button and its window: a colour, a two-colour gradient with a direction, or a picture. */
export function BackgroundButton({ value, onChange }: Props) {
  const [draft, setDraft] = useState<Background | null>(null); // null = closed
  const select = "h-8 rounded-lg border bg-background px-2";

  // Switching the kind keeps the colours already chosen
  const setKind = (kind: Background["kind"]) => {
    const color = draft?.kind === "color" ? draft.color : draft?.kind === "gradient" ? draft.from : "#ffffff";
    if (kind === "color") setDraft({ kind, color });
    else if (kind === "gradient") setDraft({ kind, from: color, to: "#6d28d9", angle: 90 });
    else setDraft({ kind, src: draft?.kind === "image" ? draft.src : "" });
  };

  const pickPicture = async () => {
    const src = await pickCheckedImage();
    if (src) setDraft({ kind: "image", src });
  };

  const apply = () => {
    onChange(draft!);
    setDraft(null);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setDraft(value ?? { kind: "color", color: "#ffffff" })}>
        Add background
      </Button>
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Background</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="flex flex-col gap-3 text-sm">
              <div role="radiogroup" aria-label="Background type" className="flex gap-2">
                {KINDS.map((k) => (
                  <Button
                    key={k.kind}
                    size="sm"
                    role="radio"
                    aria-checked={draft.kind === k.kind}
                    variant={draft.kind === k.kind ? "default" : "outline"}
                    onClick={() => setKind(k.kind)}
                  >
                    {k.label}
                  </Button>
                ))}
              </div>
              {draft.kind === "color" && (
                <label className="flex items-center gap-2">
                  Background color
                  <input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
                </label>
              )}
              {draft.kind === "gradient" && (
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2">
                    From
                    <input type="color" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
                  </label>
                  <label className="flex items-center gap-2">
                    To
                    <input type="color" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
                  </label>
                  <label className="flex items-center gap-2">
                    Direction
                    <select
                      className={select}
                      value={draft.angle}
                      onChange={(e) => setDraft({ ...draft, angle: Number(e.target.value) })}
                    >
                      {DIRECTIONS.map((d) => (
                        <option key={d.angle} value={d.angle}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {draft.kind === "image" && (
                <Button variant="outline" className="self-start" onClick={pickPicture}>
                  {draft.src ? "Choose another picture" : "Choose picture"}
                </Button>
              )}
              <SlideRenderer elements={[]} background={draft} aria-label="Background preview" className="border" />
            </div>
          )}
          <DialogFooter>
            {value && (
              <Button
                variant="outline"
                onClick={() => {
                  onChange(undefined);
                  setDraft(null);
                }}
              >
                Remove background
              </Button>
            )}
            <Button disabled={draft?.kind === "image" && !draft.src} onClick={apply}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
