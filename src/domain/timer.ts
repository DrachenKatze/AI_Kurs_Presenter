import type { Slide, SlideElement } from "./types";

export const DEFAULT_TIMER_SECONDS = 10;

export const isTimerVisible = (slide: Slide) => slide.elements.some((e) => e.kind === "timer");

function timerElement(): SlideElement {
  return { id: crypto.randomUUID(), kind: "timer", x: 85, y: 3, w: 12, h: 12, style: { fontSize: 50, bold: true } };
}

/** Sets the countdown of a slide. Visible adds the timer element (an existing one keeps its place and style). */
export function setTimer(slide: Slide, seconds: number, visible: boolean): Slide {
  const has = isTimerVisible(slide);
  const elements = visible
    ? has
      ? slide.elements
      : [...slide.elements, timerElement()]
    : slide.elements.filter((e) => e.kind !== "timer");
  return { ...slide, timer: seconds, elements };
}

export function removeTimer(slide: Slide): Slide {
  return { ...slide, timer: undefined, elements: slide.elements.filter((e) => e.kind !== "timer") };
}

/** Slides whose own timer settings differ from (seconds, visible); applying to all would overwrite them. */
export const individualTimers = (slides: Slide[], seconds: number, visible: boolean) =>
  slides.filter((s) => s.timer !== undefined && (s.timer !== seconds || isTimerVisible(s) !== visible)).length;
