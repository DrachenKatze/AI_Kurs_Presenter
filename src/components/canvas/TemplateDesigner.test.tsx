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

test("with Snap on, a small move snaps back onto the other element's edge, and the choice is remembered", async () => {
  fireEvent.click(await screen.findByLabelText("Snap to elements"));
  expect(localStorage.getItem("presenter:snap")).toBe("1");

  const title = screen.getByLabelText("Element Title"); // x 5, same left edge as Body
  fireEvent.pointerDown(title, { clientX: 100, clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(title, { clientX: 110, clientY: 100, pointerId: 1 }); // +1% x
  fireEvent.pointerUp(title, { pointerId: 1 });
  expect(left(screen.getByLabelText("Element Title"))).toBe(5);
  localStorage.removeItem("presenter:snap");
});

test("editing the standard template gives it its own id and name", async () => {
  fireEvent.pointerDown(await screen.findByLabelText("Element Body"), { clientX: 0, clientY: 0, pointerId: 1 });
  fireEvent.keyDown(screen.getByLabelText("Template canvas"), { key: "Delete" });
  expect(screen.getByLabelText("Template name")).toHaveValue("My template");
});

test("Add Timer toggles to Remove Timer; Seconds and Visible set the template timer, which can be styled", async () => {
  fireEvent.click(await screen.findByRole("button", { name: "Add Timer" }));
  expect(screen.getByLabelText("Seconds")).toHaveValue(10);
  expect(screen.queryByLabelText("Element timer")).toBeNull();

  fireEvent.click(screen.getByLabelText("Visible"));
  fireEvent.change(screen.getByLabelText("Seconds"), { target: { value: "7" } });
  const timer = screen.getByLabelText("Element timer");
  expect(timer).toHaveTextContent("7");
  fireEvent.pointerDown(timer, { clientX: 0, clientY: 0, pointerId: 1 });
  expect(screen.getByRole("button", { name: "Style" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Remove Timer" }));
  expect(screen.queryByLabelText("Element timer")).toBeNull();
  expect(screen.queryByLabelText("Seconds")).toBeNull();
});

test("Animation: shake, jump and grow/shrink can be combined; the editor canvas stays still", async () => {
  fireEvent.pointerDown(await screen.findByLabelText("Element Title"), { clientX: 0, clientY: 0, pointerId: 1 });
  fireEvent.click(screen.getByRole("button", { name: "Animation" }));
  fireEvent.click(screen.getByLabelText("Shake"));
  fireEvent.click(screen.getByLabelText("Jump"));
  fireEvent.click(screen.getByLabelText("Grow and shrink"));
  fireEvent.change(screen.getByLabelText("Shake angle"), { target: { value: "20" } });
  fireEvent.change(screen.getByLabelText("Jump speed"), { target: { value: "2" } });
  // the open dialog hides the page behind it from role queries
  expect(screen.getByRole("button", { name: "Animation", hidden: true })).toHaveAttribute("aria-pressed", "true");

  fireEvent.click(screen.getByLabelText("Shake")); // off again
  expect(screen.queryByLabelText("Shake angle")).toBeNull();
  const content = screen.getByLabelText("Element Title").firstElementChild as HTMLElement;
  expect(content.style.animation).toBe("");
});

describe("saving and loading local files", () => {
  let saved: string[] = [];
  beforeEach(async () => {
    const files = await import("@/lib/files");
    saved = [];
    // the save folder already holds Lecture.template.json
    vi.spyOn(files, "fileExists").mockImplementation(async (name) => name === "Lecture.template.json");
    vi.spyOn(files, "saveFile").mockImplementation(async (name, _content, _type, kind) => {
      saved.push(`${kind}/${name}`);
      return "Saved";
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const saveAs = async (name: string) => {
    fireEvent.click(await screen.findByText("Save template"));
    fireEvent.change(screen.getByLabelText("New template name"), { target: { value: name } });
    fireEvent.click(screen.getByText("Save"));
  };

  test("Save as with a new name writes a new file", async () => {
    await saveAs("Fresh");
    await screen.findByText("Saved");
    expect(saved).toEqual(["Templates/Fresh.template.json"]);
    expect(screen.getByLabelText("Template name")).toHaveValue("Fresh");
  });

  test("Save as onto an existing file asks first: No saves nothing, Yes overwrites it", async () => {
    await saveAs(" Lecture ");
    fireEvent.click(await screen.findByText("No"));
    expect(screen.queryByText("Overwrite template?")).not.toBeInTheDocument();
    expect(saved).toEqual([]);

    await saveAs("Lecture");
    fireEvent.click(await screen.findByText("Yes"));
    await screen.findByText("Saved");
    expect(saved).toEqual(["Templates/Lecture.template.json"]);
  });

  test("there is a single save button", async () => {
    await screen.findByText("Save template");
    expect(screen.queryByText("Save as…")).not.toBeInTheDocument();
  });

  test("Load template opens a picked file", async () => {
    const files = await import("@/lib/files");
    vi.spyOn(files, "pickFile").mockResolvedValue(
      JSON.stringify({ version: 1, id: "t1", name: "From disk", elements: [] }),
    );
    fireEvent.click(await screen.findByText("Load template"));
    expect(await screen.findByDisplayValue("From disk")).toBeInTheDocument();
  });
});
