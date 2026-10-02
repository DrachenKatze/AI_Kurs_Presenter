import type { SlideElement } from "./types";

export const MIN_SIZE = 3; // percent

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** New position after moving by (dx, dy) percent; the element stays inside the slide. */
export function moveElement(e: SlideElement, dx: number, dy: number): Pick<SlideElement, "x" | "y"> {
  return { x: clamp(e.x + dx, 0, 100 - e.w), y: clamp(e.y + dy, 0, 100 - e.h) };
}

/** New size after dragging the bottom-right corner by (dx, dy) percent. */
export function resizeElement(e: SlideElement, dx: number, dy: number): Pick<SlideElement, "w" | "h"> {
  return { w: clamp(e.w + dx, MIN_SIZE, 100 - e.x), h: clamp(e.h + dy, MIN_SIZE, 100 - e.y) };
}
