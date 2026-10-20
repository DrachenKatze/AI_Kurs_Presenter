import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { createProject } from "@/domain/project";
import { moveById } from "@/domain/order";
import { generateSlides } from "@/domain/presentation";
import { standardTemplate } from "@/domain/template";
import { setTimer } from "@/domain/timer";
import type { DataTable } from "@/domain/types";
import { ProjectProvider, useProject } from "@/state/ProjectContext";
import { PresentationRunner } from "./PresentationRunner";
import { PresentationView } from "./PresentationView";

const table: DataTable = {
  columns: [{ id: "c1", name: "Title" }],
  rows: [
    { id: "r1", hidden: false, cells: { c1: "One" } },
    { id: "r2", hidden: true, cells: { c1: "Hidden" } },
    { id: "r3", hidden: false, cells: { c1: "Two" } },
    { id: "r4", hidden: false, cells: { c1: "Three" } },
  ],
};

function Open() {
  const { state, dispatch } = useProject();
  useEffect(() => {
    dispatch({ type: "open", project: { ...createProject("P"), table } });
  }, [dispatch]);
  return state.project ? <PresentationView /> : null;
}

test("New Presentation creates one slide per visible row; Start is enabled afterwards", async () => {
  render(
    <ProjectProvider>
      <Open />
    </ProjectProvider>,
  );
  const start = await screen.findByRole("button", { name: "Start Presentation" });
  expect(start).toBeDisabled();

  await userEvent.click(screen.getByRole("button", { name: "New Presentation" }));
  expect(screen.getAllByLabelText(/^Slide \d$/)).toHaveLength(3);
  expect(screen.getByLabelText("Slide 3")).toHaveTextContent("Three");
  expect(start).toBeEnabled();

  // regenerating asks first
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  await userEvent.click(screen.getByRole("button", { name: "New Presentation" }));
  expect(confirm).toHaveBeenCalled();
});

test("slides take over the template's timer seconds and styled timer element", () => {
  const template = setTimer({ ...standardTemplate(table.columns), timer: undefined }, 7, true);
  template.elements = template.elements.map((e) => (e.kind === "timer" ? { ...e, style: { fontSize: 30, color: "#ff0000" } } : e));
  const [slide] = generateSlides(table, template);
  expect(slide.timer).toBe(7);
  expect(slide.elements.find((e) => e.kind === "timer")?.style?.color).toBe("#ff0000");
  expect(generateSlides(table, standardTemplate(table.columns))[0].timer).toBeUndefined();
});

test("moveById reorders and ignores unknown ids", () => {
  const slides = generateSlides(table, standardTemplate(table.columns));
  const [a, b, c] = slides.map((s) => s.id);
  expect(moveById(slides, a, c).map((s) => s.id)).toEqual([b, c, a]);
  expect(moveById(slides, c, a).map((s) => s.id)).toEqual([c, a, b]);
  expect(moveById(slides, a, "nope")).toBe(slides);
});

test("runner: arrow keys and click change the slide, Esc exits", () => {
  const slides = generateSlides(table, standardTemplate(table.columns));
  const onExit = vi.fn();
  render(<PresentationRunner slides={slides} onExit={onExit} />);
  const runner = screen.getByRole("dialog");
  const shown = () => runner.textContent;

  expect(shown()).toBe("One");
  fireEvent.keyDown(runner, { key: "ArrowRight" });
  expect(shown()).toBe("Two");
  fireEvent.click(runner);
  expect(shown()).toBe("Three");
  fireEvent.keyDown(runner, { key: "ArrowRight" }); // stays on the last slide
  expect(shown()).toBe("Three");
  fireEvent.keyDown(runner, { key: "ArrowLeft" });
  expect(shown()).toBe("Two");

  fireEvent.keyDown(runner, { key: "Escape" });
  expect(onExit).toHaveBeenCalledOnce();
});

test("runner: a timer counts down and moves on at 0, hidden or visible; the last slide stays", () => {
  vi.useFakeTimers();
  const [a, b, c] = generateSlides(table, standardTemplate(table.columns));
  const slides = [setTimer(a, 2, true), setTimer(b, 1, false), c];
  render(<PresentationRunner slides={slides} onExit={() => {}} />);
  const shown = () => screen.getByRole("dialog").textContent;

  expect(shown()).toBe("One2");
  act(() => vi.advanceTimersByTime(1000));
  expect(shown()).toBe("One1");
  act(() => vi.advanceTimersByTime(1000));
  expect(shown()).toBe("Two"); // hidden timer, still runs
  act(() => vi.advanceTimersByTime(1000));
  expect(shown()).toBe("Three");
  act(() => vi.advanceTimersByTime(5000));
  expect(shown()).toBe("Three");
  vi.useRealTimers();
});

test("Add Timer toggles to Remove Timer; Seconds and Visible show only with a timer and apply directly", async () => {
  render(
    <ProjectProvider>
      <Open />
    </ProjectProvider>,
  );
  await userEvent.click(await screen.findByRole("button", { name: "New Presentation" }));
  expect(screen.queryByLabelText("Seconds")).toBeNull();
  expect(screen.queryByLabelText("Visible")).toBeNull();

  await userEvent.click(screen.getByRole("button", { name: "Add Timer" }));
  expect(screen.queryByRole("button", { name: "Add Timer" })).toBeNull();
  expect(screen.getByLabelText("Seconds")).toHaveValue(10);
  expect(screen.getByLabelText("Visible")).not.toBeChecked();

  await userEvent.click(screen.getByLabelText("Visible"));
  expect(screen.getAllByLabelText(/^Slide \d$/).every((s) => s.textContent?.includes("10"))).toBe(true);
  fireEvent.change(screen.getByLabelText("Seconds"), { target: { value: "5" } });
  expect(screen.getAllByLabelText(/^Slide \d$/).every((s) => s.textContent?.includes("5"))).toBe(true);

  await userEvent.click(screen.getByRole("button", { name: "Remove Timer" }));
  expect(screen.getByLabelText("Slide 1")).not.toHaveTextContent("5");
  expect(screen.getByRole("button", { name: "Add Timer" })).toBeInTheDocument();
  expect(screen.queryByLabelText("Seconds")).toBeNull();
});
