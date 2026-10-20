"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SlideElement, TextStyle } from "@/domain/types";
import { TextStyleBar } from "./TextStyleBar";

/** "Style" button of a selected timer: colour or gradient of the numbers, font, shadow and glow. */
export function TimerStyleButton({ element, onChange }: { element: SlideElement; onChange: (style: TextStyle) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Style
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer style</DialogTitle>
          </DialogHeader>
          <TextStyleBar element={element} onChange={onChange} allowGradient />
        </DialogContent>
      </Dialog>
    </>
  );
}
