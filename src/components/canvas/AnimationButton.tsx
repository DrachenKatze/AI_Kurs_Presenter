"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ANIMATIONS } from "@/domain/animation";
import type { Animation, SlideElement } from "@/domain/types";

const input = "h-8 w-20 rounded-lg border bg-background px-2";
const positive = (v: string, min: number) => Math.max(min, Number(v) || min);

/** "Animation" button of a selected element: shake, jump and grow/shrink, each with its amount and speed, in any mix. */
export function AnimationButton({ element, onChange }: { element: SlideElement; onChange: (a: Animation | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const a = element.animation ?? {};
  const set = (patch: Animation) => {
    const next = { ...a, ...patch };
    onChange(Object.values(next).some(Boolean) ? next : undefined);
  };

  return (
    <>
      <Button size="sm" aria-pressed={!!element.animation} onClick={() => setOpen(true)}>
        Animation
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Animation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Plays in the presentation while the slide is shown.</p>
          {ANIMATIONS.map(({ key, label, amount, unit, initial }) => {
            const part = a[key] as Record<string, number> | undefined;
            return (
              <fieldset key={key} className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex w-36 items-center gap-2 font-medium">
                  <input type="checkbox" checked={!!part} onChange={(e) => set({ [key]: e.target.checked ? initial : undefined })} />
                  {label}
                </label>
                {part && (
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        aria-label={`${label} ${amount}`}
                        className={input}
                        value={part[amount]}
                        onChange={(e) => set({ [key]: { ...part, [amount]: positive(e.target.value, 1) } })}
                      />
                      {unit}
                    </label>
                    <label className="flex items-center gap-2">
                      Speed
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        aria-label={`${label} speed`}
                        className={input}
                        value={part.speed}
                        onChange={(e) => set({ [key]: { ...part, speed: positive(e.target.value, 0.1) } })}
                      />
                      s
                    </label>
                  </>
                )}
              </fieldset>
            );
          })}
        </DialogContent>
      </Dialog>
    </>
  );
}
