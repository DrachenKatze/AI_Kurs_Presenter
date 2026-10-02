"use client";

import { useEffect, useRef, useState } from "react";
import { SlideRenderer } from "@/components/canvas/SlideRenderer";
import type { Slide } from "@/domain/types";

/** Borderless fullscreen runner: ←/→ or click to navigate, Esc to leave. */
export function PresentationRunner({ slides, onExit }: { slides: Slide[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const exit = useRef(onExit);

  const go = (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), slides.length - 1));

  useEffect(() => {
    exit.current = onExit;
  });

  useEffect(() => {
    const el = root.current;
    el?.focus();
    el?.requestFullscreen?.().catch(() => {}); // not available in every browser; the overlay still covers the page
    // In fullscreen the browser swallows Esc and only reports that fullscreen ended.
    const onFullscreenChange = () => !document.fullscreenElement && exit.current();
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  return (
    <div
      ref={root}
      tabIndex={0}
      role="dialog"
      aria-label="Presentation"
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black outline-none"
      onClick={() => go(1)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
        else if (e.key === "Escape") onExit();
      }}
    >
      <SlideRenderer
        elements={slides[index].elements}
        className="w-[min(100vw,calc(100vh*16/9))]"
        aria-label={`Slide ${index + 1} of ${slides.length}`}
      />
    </div>
  );
}
