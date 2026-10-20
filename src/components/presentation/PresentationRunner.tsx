"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SlideRenderer } from "@/components/canvas/SlideRenderer";
import type { Slide } from "@/domain/types";
import { cn } from "@/lib/utils";

const EFFECT_MS = 800; // longest effect incl. delays, see the fx-* classes in globals.css
const COLS = 16;
const ROWS = 9;
// 7919 is prime, so this visits every tile once in a scattered order: a fixed "random" value per tile
const scatter = (i: number) => ((i * 7919) % (COLS * ROWS)) / (COLS * ROWS);

/** The old slide cut into tiles that fly apart. */
function Explosion({ slide, timer }: { slide: Slide; timer?: number }) {
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const [x, y] = [(i % COLS) * (100 / COLS), Math.floor(i / COLS) * (100 / ROWS)];
    const [cx, cy] = [x + 50 / COLS, y + 50 / ROWS];
    const style = {
      clipPath: `inset(${y}% ${100 - x - 100 / COLS}% ${100 - y - 100 / ROWS}% ${x}%)`,
      transformOrigin: `${cx}% ${cy}%`,
      "--d": `${scatter(i) * 100}ms`,
      "--dx": `${(cx - 50) * 1.5}%`,
      "--dy": `${(cy - 50) * 1.5}%`,
      "--r": `${(scatter(i) - 0.5) * 720}deg`,
    } as CSSProperties;
    return (
      <SlideRenderer
        key={i}
        aria-hidden
        elements={slide.elements}
        background={slide.background}
        timer={timer}
        className="fx-explode absolute inset-0"
        style={style}
      />
    );
  });
}

/** Borderless fullscreen runner: ←/→ or click to navigate, Esc to leave. Slides with a timer move on when it reaches 0. */
export function PresentationRunner({ slides, onExit }: { slides: Slide[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(slides[0].timer); // seconds left on this slide
  // The slide being left while the new one's effect plays
  const [from, setFrom] = useState<{ index: number; left?: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const exit = useRef(onExit);

  const show = (next: number) => {
    const t = slides[next].transition;
    if (next !== index) setFrom(t && t !== "none" ? { index, left } : null);
    setIndex(next);
    setLeft(slides[next].timer); // every visit starts the countdown again
  };
  const go = (delta: number) => show(Math.min(Math.max(index + delta, 0), slides.length - 1));
  const showRef = useRef(show);

  useEffect(() => {
    if (!left) return; // no timer, or the last slide ran out and stays at 0
    const t = setTimeout(() => {
      if (left > 1 || index === slides.length - 1) return setLeft(left - 1);
      showRef.current(index + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [left, index, slides]);

  useEffect(() => {
    if (!from) return;
    const t = setTimeout(() => setFrom(null), EFFECT_MS);
    return () => clearTimeout(t);
  }, [from]);

  useEffect(() => {
    exit.current = onExit;
    showRef.current = show;
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

  const effect = from ? slides[index].transition : undefined;
  const old = from && slides[from.index];

  return (
    <div
      ref={root}
      tabIndex={0}
      role="dialog"
      aria-label="Presentation"
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden bg-black outline-none"
      onClick={() => go(1)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
        else if (e.key === "Escape") onExit();
      }}
    >
      <div className="relative w-[min(100vw,calc(100vh*16/9))] [perspective:150vw]">
        {/* Fade shows the new slide over the fading old one; explode and turn take the old one away on top */}
        {old && effect === "fade" && (
          <SlideRenderer
            aria-hidden
            elements={old.elements}
            background={old.background}
            timer={from.left}
            className="fx-fade-out absolute inset-0"
          />
        )}
        <SlideRenderer
          key={index} // restarts the effect on every change
          elements={slides[index].elements}
          background={slides[index].background}
          timer={left}
          className={cn(effect === "fade" && "fx-fade-in-late")}
          aria-label={`Slide ${index + 1} of ${slides.length}`}
        />
        {old && effect === "explode" && <Explosion key={from.index} slide={old} timer={from.left} />}
        {old && effect === "turn" && (
          <SlideRenderer
            aria-hidden
            elements={old.elements}
            background={old.background}
            timer={from.left}
            className="fx-turn absolute inset-0"
          />
        )}
      </div>
    </div>
  );
}
