import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { createProject } from "@/domain/project";
import { moveById } from "@/domain/order";
import { generateSlides } from "@/domain/presentation";
import { standardTemplate } from "@/domain/template";
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
  vi.stubGlobal("fetch", vi.fn(async () => Response.json([])));
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
