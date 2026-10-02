import { moveElement, resizeElement } from "./geometry";
import { fieldElement } from "./template";

const el = { ...fieldElement("A", 10, 10), w: 20, h: 10 };

test("moveElement shifts by the delta and stays inside the slide", () => {
  expect(moveElement(el, 5, -3)).toEqual({ x: 15, y: 7 });
  expect(moveElement(el, -50, -50)).toEqual({ x: 0, y: 0 });
  expect(moveElement(el, 500, 500)).toEqual({ x: 80, y: 90 });
});

test("resizeElement changes w/h, keeps a minimum and the slide edge", () => {
  expect(resizeElement(el, 5, 5)).toEqual({ w: 25, h: 15 });
  expect(resizeElement(el, -100, -100)).toEqual({ w: 3, h: 3 });
  expect(resizeElement(el, 500, 500)).toEqual({ w: 90, h: 90 });
});

test("fieldElement is clamped into the slide", () => {
  const f = fieldElement("A", 99, 99);
  expect(f.x + f.w).toBe(100);
  expect(f.y + f.h).toBe(100);
});
