import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { generateSlides } from "@/domain/presentation";
import { createProject } from "@/domain/project";
import { standardTemplate } from "@/domain/template";
import type { DataTable } from "@/domain/types";
import { pickImage } from "@/lib/files";
import { ProjectProvider, useProject } from "@/state/ProjectContext";
import { PresentationView } from "./PresentationView";

vi.mock("@/lib/files", () => ({ pickImage: vi.fn() }));

const table: DataTable = {
  columns: [
    { id: "c1", name: "Title" },
    { id: "c2", name: "Body" },
  ],
  rows: [
    { id: "r1", hidden: false, cells: { c1: "One", c2: "first" } },
    { id: "r2", hidden: false, cells: { c1: "Two", c2: "second" } },
  ],
};

function Open() {
  const { state, dispatch } = useProject();
  useEffect(() => {
    const project = createProject("P");
    project.table = table;
    project.presentation.slides = generateSlides(table, standardTemplate(table.columns));
    dispatch({ type: "open", project });
  }, [dispatch]);
  return state.project ? <PresentationView /> : null;
}

const canvas = () => screen.getByLabelText("Template canvas");
const elements = () => canvas().querySelectorAll("[aria-label^='Element']").length;

async function openEditor(slide = 1) {
  render(
    <ProjectProvider>
      <Open />
    </ProjectProvider>,
  );
  await userEvent.dblClick(await screen.findByLabelText(`Slide ${slide}`));
  await screen.findByText(`Edit slide ${slide}`);
}

test("double-click opens the slide editor; unmapped columns of that row can be added back", async () => {
  await openEditor();
  const sidebar = screen.getByLabelText("Unused columns");
  expect(sidebar).toHaveTextContent("All columns are on the slide.");

  fireEvent.pointerDown(screen.getByLabelText("Element Body"), { pointerId: 1 });
  fireEvent.keyDown(canvas(), { key: "Delete" });
  expect(screen.queryByLabelText("Element Body")).not.toBeInTheDocument();
  expect(sidebar).toHaveTextContent("Body");

  await userEvent.click(screen.getByRole("button", { name: "Body" }));
  expect(screen.getByLabelText("Element Body")).toHaveTextContent("first"); // this slide's row value
  expect(sidebar).toHaveTextContent("All columns are on the slide.");
});

test("edits change only that slide", async () => {
  await openEditor(1);
  fireEvent.pointerDown(screen.getByLabelText("Element Body"), { pointerId: 1 });
  fireEvent.keyDown(canvas(), { key: "Delete" });
  await userEvent.click(screen.getByRole("button", { name: "Close" }));

  expect(screen.getByLabelText("Slide 1")).not.toHaveTextContent("first");
  expect(screen.getByLabelText("Slide 2")).toHaveTextContent("second");
});

test("layer order and rotation of the selected element", async () => {
  await openEditor();
  const order = () => [...canvas().querySelectorAll("[aria-label^='Element']")].map((e) => e.getAttribute("aria-label"));
  expect(order()).toEqual(["Element Title", "Element Body"]);
  expect(screen.getByRole("button", { name: "Rotate left" })).toBeDisabled();

  fireEvent.pointerDown(screen.getByLabelText("Element Title"), { pointerId: 1 });
  expect(screen.getByRole("button", { name: "Send backward" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Bring forward" }));
  expect(order()).toEqual(["Element Body", "Element Title"]);

  await userEvent.click(screen.getByRole("button", { name: "Rotate left" }));
  expect(screen.getByLabelText("Element Title").style.transform).toBe("rotate(345deg)");
  await userEvent.click(screen.getByRole("button", { name: "Rotate right" }));
  expect(screen.getByLabelText("Element Title").style.transform).toBe("");
});

test("add a text box and edit its text", async () => {
  await openEditor();
  const before = elements();
  await userEvent.click(screen.getByRole("button", { name: "Add text box" }));
  expect(elements()).toBe(before + 1);

  vi.spyOn(window, "prompt").mockReturnValue("Hello");
  await userEvent.dblClick(screen.getByLabelText("Element text"));
  expect(screen.getByLabelText("Element text")).toHaveTextContent("Hello");
});

test("add an image; images over 2 MB ask first", async () => {
  await openEditor();
  const before = elements();
  const confirm = vi.spyOn(window, "confirm");

  vi.mocked(pickImage).mockResolvedValueOnce({ src: "data:image/png;base64,AAAA", size: 100 });
  await userEvent.click(screen.getByRole("button", { name: "Add image" }));
  expect(await screen.findByLabelText("Element image")).toBeInTheDocument();
  expect(confirm).not.toHaveBeenCalled();

  confirm.mockReturnValue(false);
  vi.mocked(pickImage).mockResolvedValueOnce({ src: "data:image/png;base64,BBBB", size: 3 * 1024 * 1024 });
  await userEvent.click(screen.getByRole("button", { name: "Add image" }));
  expect(confirm).toHaveBeenCalledOnce();
  expect(elements()).toBe(before + 1); // declined: not added
});
