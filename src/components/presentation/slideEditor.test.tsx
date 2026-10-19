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

test("text style of the selected element", async () => {
  await openEditor();
  expect(screen.queryByLabelText("Text style")).not.toBeInTheDocument();
  fireEvent.pointerDown(screen.getByLabelText("Element Title"), { pointerId: 1 });
  const text = () => screen.getByLabelText("Element Title").firstElementChild as HTMLElement;

  fireEvent.change(screen.getByLabelText("Color"), { target: { value: "#ff0000" } });
  fireEvent.change(screen.getByLabelText("Size"), { target: { value: "40" } });
  await userEvent.selectOptions(screen.getByLabelText("Font"), "Georgia");
  await userEvent.click(screen.getByRole("button", { name: "Bold" }));
  await userEvent.click(screen.getByRole("button", { name: "Italic" }));
  await userEvent.selectOptions(screen.getByLabelText("Effect"), "glow");
  fireEvent.change(screen.getByLabelText("Effect color"), { target: { value: "#00ff00" } });

  expect(text().style).toMatchObject({ color: "rgb(255, 0, 0)", fontSize: "4cqw", fontFamily: "Georgia", fontWeight: "700", fontStyle: "italic" });
  expect(text().style.textShadow).toContain("#00ff00");
});

test("background: color, gradient, picture, remove", async () => {
  await openEditor();
  const bg = () => canvas().style.background;
  const open = () => userEvent.click(screen.getByRole("button", { name: "Add background" }));

  await open();
  fireEvent.change(screen.getByLabelText("Background color"), { target: { value: "#ff0000" } });
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(bg()).toContain("rgb(255, 0, 0)");
  expect(screen.getByLabelText("Slide 1").firstElementChild).toHaveStyle({ background: "rgb(255, 0, 0)" }); // thumbnail too

  await open();
  await userEvent.click(screen.getByRole("radio", { name: "Gradient" }));
  await userEvent.selectOptions(screen.getByLabelText("Direction"), "Top to bottom");
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(bg()).toContain("linear-gradient(180deg");

  await open();
  await userEvent.click(screen.getByRole("radio", { name: "Picture" }));
  expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  vi.mocked(pickImage).mockResolvedValueOnce({ src: "data:image/png;base64,AAAA", size: 100 });
  await userEvent.click(screen.getByRole("button", { name: "Choose picture" }));
  await userEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(bg()).toContain("data:image/png;base64,AAAA");

  await open();
  await userEvent.click(screen.getByRole("button", { name: "Remove background" }));
  expect(bg()).toBe("");
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

test("timer of one slide: seconds, visibility, style with gradient", async () => {
  await openEditor();
  expect(screen.queryByLabelText("Timer seconds")).not.toBeInTheDocument(); // no timer set yet
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  await userEvent.click(screen.getByRole("button", { name: "Add Timer" }));
  await userEvent.dblClick(screen.getByLabelText("Slide 1"));

  fireEvent.change(screen.getByLabelText("Timer seconds"), { target: { value: "7" } });
  expect(screen.queryByLabelText("Element timer")).not.toBeInTheDocument();
  await userEvent.click(screen.getByLabelText("Timer visible"));
  expect(screen.getByLabelText("Element timer")).toHaveTextContent("7");

  fireEvent.pointerDown(screen.getByLabelText("Element timer"), { pointerId: 1 });
  expect(screen.getByRole("button", { name: "Bring forward" })).toBeDisabled(); // always in front
  expect(screen.queryByLabelText("Text style")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Style" }));
  await userEvent.selectOptions(screen.getByLabelText("Fill"), "gradient");
  await userEvent.selectOptions(screen.getByLabelText("Effect"), "glow");
  const timer = screen.getByLabelText("Element timer").firstElementChild as HTMLElement;
  expect(timer.style.backgroundImage).toContain("linear-gradient(90deg");
  expect(timer.style.filter).toContain("drop-shadow");

  await userEvent.keyboard("{Escape}");
  expect(screen.getByLabelText("Slide 2")).not.toHaveTextContent("7"); // other slides keep 10
});
