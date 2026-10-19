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

export const SNAP_DISTANCE = 1.5; // percent

// Snap lines on one axis: the slide's edges and centre, and every other element's edges and centre.
const lines = (others: SlideElement[], pos: "x" | "y", size: "w" | "h") => [
  0,
  50,
  100,
  ...others.flatMap((o) => [o[pos], o[pos] + o[size] / 2, o[pos] + o[size]]),
];

/** Shift that puts the closest of `points` onto a line within SNAP_DISTANCE; 0 if none is that close. */
function nudge(points: number[], targets: number[]) {
  let best = 0;
  let dist = SNAP_DISTANCE;
  for (const p of points)
    for (const t of targets)
      if (Math.abs(t - p) < dist) {
        dist = Math.abs(t - p);
        best = t - p;
      }
  return best;
}

/** Position of a moved element, pulled so an edge or its centre lines up with a nearby snap line. */
export function snapMove(e: SlideElement, others: SlideElement[]): Pick<SlideElement, "x" | "y"> {
  const dx = nudge([e.x, e.x + e.w / 2, e.x + e.w], lines(others, "x", "w"));
  const dy = nudge([e.y, e.y + e.h / 2, e.y + e.h], lines(others, "y", "h"));
  return { x: clamp(e.x + dx, 0, 100 - e.w), y: clamp(e.y + dy, 0, 100 - e.h) };
}

/** Size of a resized element, pulled so its right/bottom edge lines up with a nearby snap line. */
export function snapResize(e: SlideElement, others: SlideElement[]): Pick<SlideElement, "w" | "h"> {
  const dw = nudge([e.x + e.w], lines(others, "x", "w"));
  const dh = nudge([e.y + e.h], lines(others, "y", "h"));
  return { w: clamp(e.w + dw, MIN_SIZE, 100 - e.x), h: clamp(e.h + dh, MIN_SIZE, 100 - e.y) };
}
