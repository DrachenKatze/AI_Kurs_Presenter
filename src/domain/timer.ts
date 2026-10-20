import type { Slide, SlideElement } from "./types";

export const DEFAULT_TIMER_SECONDS = 10;

/** A slide or a template: both carry a countdown and may show it as a timer element. */
type Timed = { elements: SlideElement[]; timer?: number };

export const isTimerVisible = (slide: Timed) => slide.elements.some((e) => e.kind === "timer");

function timerElement(): SlideElement {
  return { id: crypto.randomUUID(), kind: "timer", x: 85, y: 3, w: 12, h: 12, style: { fontSize: 50, bold: true } };
}

/** Sets the countdown of a slide. Visible adds the timer element (an existing one keeps its place and style). */
export function setTimer<T extends Timed>(slide: T, seconds: number, visible: boolean): T {
  const has = isTimerVisible(slide);
  const elements = visible
    ? has
      ? slide.elements
      : [...slide.elements, timerElement()]
    : slide.elements.filter((e) => e.kind !== "timer");
  return { ...slide, timer: seconds, elements };
}

export function removeTimer<T extends Timed>(slide: T): T {
  return { ...slide, timer: undefined, elements: slide.elements.filter((e) => e.kind !== "timer") };
}

/** Slides whose own timer settings differ from (seconds, visible); applying to all would overwrite them. */
export const individualTimers = (slides: Slide[], seconds: number, visible: boolean) =>
  slides.filter((s) => s.timer !== undefined && (s.timer !== seconds || isTimerVisible(s) !== visible)).length;
