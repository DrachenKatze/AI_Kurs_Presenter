import { moveElement, resizeElement, snapMove, snapResize } from "./geometry";
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

test("snapMove lines edges and centres up with nearby elements and the slide", () => {
  const other = { ...el, x: 40, y: 60, w: 20, h: 10 }; // edges at x 40/50/60, y 60/65/70
  expect(snapMove({ ...el, x: 61, y: 69 }, [other])).toEqual({ x: 60, y: 70 }); // left onto right, top onto bottom
  expect(snapMove({ ...el, x: 30.5, y: 30 }, [other])).toEqual({ x: 30, y: 30 }); // centre 40.5 onto the other's left edge 40
  expect(snapMove({ ...el, x: 25, y: 25 }, [other])).toEqual({ x: 25, y: 25 }); // nothing near: unchanged
  expect(snapMove({ ...el, x: 1, y: 89 }, [])).toEqual({ x: 0, y: 90 }); // slide edges
});

test("snapResize pulls the right/bottom edge onto nearby lines", () => {
  const other = { ...el, x: 50, y: 50, w: 20, h: 20 };
  expect(snapResize({ ...el, x: 10, y: 10, w: 39, h: 41 }, [other])).toEqual({ w: 40, h: 40 });
  expect(snapResize({ ...el, x: 10, y: 10, w: 30, h: 30 }, [other])).toEqual({ w: 30, h: 30 });
});

test("fieldElement is clamped into the slide", () => {
  const f = fieldElement("A", 99, 99);
  expect(f.x + f.w).toBe(100);
  expect(f.y + f.h).toBe(100);
});
