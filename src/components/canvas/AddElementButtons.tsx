"use client";

import { Button } from "@/components/ui/button";
import { IMAGE_WARN_BYTES, imageElement, textElement } from "@/domain/template";
import type { SlideElement } from "@/domain/types";
import { pickImage } from "@/lib/files";

/** Adds an ad-hoc text box or an uploaded image (PNG/JPG/SVG, embedded as a data URL). */
export function AddElementButtons({ onAdd }: { onAdd: (e: SlideElement) => void }) {
  const addImage = async () => {
    const img = await pickImage();
    if (!img) return;
    const mb = (img.size / 1024 / 1024).toFixed(1);
    if (img.size > IMAGE_WARN_BYTES && !window.confirm(`This image is ${mb} MB and will be stored inside the file. Add it anyway?`)) return;
    onAdd(imageElement(img.src));
  };

  return (
    <>
      <Button variant="outline" onClick={() => onAdd(textElement())}>
        Add text box
      </Button>
      <Button variant="outline" onClick={addImage}>
        Add image
      </Button>
    </>
  );
}
