import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { createProject } from "@/domain/project";
import { COLUMN_MIME } from "./EditableCanvas";
import { ProjectProvider, useProject } from "@/state/ProjectContext";
import { TemplateDesigner } from "./TemplateDesigner";

function Open() {
  const { state, dispatch } = useProject();
  useEffect(() => {
    const p = createProject("P");
    p.table = {
      columns: [
        { id: "c1", name: "Title" },
        { id: "c2", name: "Body" },
      ],
      rows: [],
    };
    dispatch({ type: "open", project: p });
  }, [dispatch]);
  return state.project ? <TemplateDesigner /> : null;
}

beforeEach(() => {
  // jsdom has no layout: pretend the canvas is 1000 x 500 px at the origin
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 1000, bottom: 500, width: 1000, height: 500, x: 0, y: 0, toJSON: () => ({}),
  });
  render(
    <ProjectProvider>
      <Open />
    </ProjectProvider>,
  );
});

const left = (el: HTMLElement) => parseFloat(el.style.left);

test("moving and resizing update the element coordinates", async () => {
  const title = await screen.findByLabelText("Element Title");
  expect([left(title), parseFloat(title.style.top)]).toEqual([5, 5]);

  fireEvent.pointerDown(title, { clientX: 100, clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(title, { clientX: 130, clientY: 150, pointerId: 1 }); // +3% x, +10% y
  fireEvent.pointerUp(title, { pointerId: 1 });
  const moved = screen.getByLabelText("Element Title");
  expect([left(moved), parseFloat(moved.style.top)]).toEqual([8, 15]);

  const before = parseFloat(moved.style.width);
  fireEvent.pointerDown(screen.getByLabelText("Resize handle"), { clientX: 0, clientY: 0, pointerId: 1 });
  fireEvent.pointerMove(moved, { clientX: -50, clientY: 0, pointerId: 1 }); // -5% width
  fireEvent.pointerUp(moved, { pointerId: 1 });
  expect(parseFloat(screen.getByLabelText("Element Title").style.width)).toBe(before - 5);
});

test("Delete frees the column, dropping it on the canvas takes it from the sidebar again", async () => {
  const sidebar = await screen.findByLabelText("Unused columns");
  expect(sidebar).toHaveTextContent("All columns are on the slide.");

  fireEvent.pointerDown(screen.getByLabelText("Element Body"), { clientX: 0, clientY: 0, pointerId: 1 });
  fireEvent.keyDown(screen.getByLabelText("Template canvas"), { key: "Delete" });
  expect(screen.queryByLabelText("Element Body")).not.toBeInTheDocument();
  expect(sidebar).toHaveTextContent("Body");

  const drop = createEvent.drop(screen.getByLabelText("Template canvas"));
  // jsdom has no DragEvent, so the fields are added by hand
  Object.defineProperties(drop, {
    clientX: { value: 500 },
    clientY: { value: 250 },
    dataTransfer: { value: { getData: (t: string) => (t === COLUMN_MIME ? "Body" : "") } },
  });
  fireEvent(screen.getByLabelText("Template canvas"), drop);

  const body = screen.getByLabelText("Element Body");
  expect(left(body)).toBe(50);
  expect(sidebar).toHaveTextContent("All columns are on the slide.");
});

test("editing the standard template gives it its own id and name", async () => {
  fireEvent.pointerDown(await screen.findByLabelText("Element Body"), { clientX: 0, clientY: 0, pointerId: 1 });
  fireEvent.keyDown(screen.getByLabelText("Template canvas"), { key: "Delete" });
  expect(screen.getByLabelText("Template name")).toHaveValue("My template");
});

describe("saving", () => {
  let puts: string[] = [];
  beforeEach(() => {
    localStorage.setItem(
      "presenter:template:old-id",
      JSON.stringify({ version: 1, id: "old-id", name: "Lecture", elements: [] }),
    );
    puts = [];
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key) => void puts.push(key));
  });
  afterEach(() => vi.restoreAllMocks());

  const saveAs = async (name: string) => {
    fireEvent.click(await screen.findByText("Save as…"));
    fireEvent.change(screen.getByLabelText("New template name"), { target: { value: name } });
    fireEvent.click(screen.getByText("Save"));
  };

  test("Save as with a new name writes a new file", async () => {
    await saveAs("Fresh");
    await screen.findByText("Template saved");
    expect(puts).toHaveLength(1);
    expect(puts[0]).not.toContain("old-id");
    expect(screen.getByLabelText("Template name")).toHaveValue("Fresh");
  });

  test("an existing name asks first: No saves nothing, Yes overwrites that file", async () => {
    await saveAs(" lecture ");
    fireEvent.click(await screen.findByText("No"));
    expect(screen.queryByText("Overwrite template?")).not.toBeInTheDocument();
    expect(puts).toEqual([]);

    await saveAs("Lecture");
    fireEvent.click(await screen.findByText("Yes"));
    await screen.findByText("Template saved");
    expect(puts).toEqual(["presenter:template:old-id"]);
  });

  test("plain Save also warns when the name belongs to another template", async () => {
    fireEvent.change(await screen.findByLabelText("Template name"), { target: { value: "Lecture" } });
    fireEvent.click(screen.getByText("Save template"));
    expect(await screen.findByText("Overwrite template?")).toBeInTheDocument();
    expect(puts).toEqual([]);
  });
});
