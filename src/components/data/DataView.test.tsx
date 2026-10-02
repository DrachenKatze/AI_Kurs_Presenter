import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { createProject } from "@/domain/project";
import { ProjectProvider, useProject } from "@/state/ProjectContext";
import { DataView } from "./DataView";

// Opens a project with a "Title" column and one row, then renders the Data View.
function Open() {
  const { state, dispatch } = useProject();
  useEffect(() => {
    const p = createProject("P");
    p.table = { columns: [{ id: "c1", name: "Title" }], rows: [{ id: "r1", hidden: false, cells: { c1: "Hi" } }] };
    dispatch({ type: "open", project: p });
  }, [dispatch]);
  return state.project ? <DataView /> : null;
}
const setup = () =>
  render(
    <ProjectProvider>
      <Open />
    </ProjectProvider>,
  );

test("edit a cell, add and delete a row", async () => {
  setup();
  const cell = await screen.findByLabelText("Title row 1");
  await userEvent.clear(cell);
  await userEvent.type(cell, "Hello");
  expect(screen.getByLabelText("Title row 1")).toHaveValue("Hello");

  await userEvent.click(screen.getByRole("button", { name: "Add row" }));
  expect(screen.getByLabelText("Title row 2")).toHaveValue("");

  await userEvent.click(screen.getByRole("button", { name: "Delete row 1" }));
  expect(screen.queryByLabelText("Title row 2")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Title row 1")).toHaveValue("");
});

test("add, rename and delete a column", async () => {
  setup();
  await userEvent.click(await screen.findByRole("button", { name: "Add column" }));
  expect(screen.getByLabelText("Column 2 row 1")).toBeInTheDocument();

  vi.spyOn(window, "prompt").mockReturnValue("Body");
  await userEvent.click(screen.getByRole("button", { name: "Column Column 2" }));
  await userEvent.click(await screen.findByRole("menuitem", { name: "Rename" }));
  expect(screen.getByLabelText("Body row 1")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Column Body" }));
  await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
  expect(screen.queryByLabelText("Body row 1")).not.toBeInTheDocument();
});

test("sort toggles between ascending and descending", async () => {
  setup();
  await userEvent.click(await screen.findByRole("button", { name: "Add row" }));
  await userEvent.type(screen.getByLabelText("Title row 2"), "A");
  // rows: "Hi", "A"
  const sort = screen.getByRole("button", { name: "Sort Title" });
  await userEvent.click(sort);
  expect(screen.getByLabelText("Title row 1")).toHaveValue("A");
  expect(sort).toHaveTextContent("↑");
  await userEvent.click(sort);
  expect(screen.getByLabelText("Title row 1")).toHaveValue("Hi");
  expect(sort).toHaveTextContent("↓");
});

test("hide toggle marks a row hidden", async () => {
  setup();
  const box = await screen.findByLabelText("Hide row 1");
  expect(box).not.toBeChecked();
  await userEvent.click(box);
  expect(screen.getByLabelText("Hide row 1")).toBeChecked();
});
