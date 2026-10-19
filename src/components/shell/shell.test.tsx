import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectProvider } from "@/state/ProjectContext";
import { Tabs } from "./Tabs";
import { TopBar } from "./TopBar";

const setup = () =>
  render(
    <ProjectProvider>
      <TopBar />
      <Tabs />
    </ProjectProvider>,
  );

test("empty state and disabled Save until a project is created", async () => {
  setup();
  expect(screen.getByText(/No project open/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Settings" })).toBeEnabled();

  await userEvent.click(screen.getByRole("button", { name: "New" }));
  expect(screen.queryByText(/No project open/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  expect(screen.getByLabelText("Project name")).toHaveValue("New Project");
});

test("Save writes the project as .json and Load opens a picked file", async () => {
  const files = await import("@/lib/files");
  let saved = "";
  vi.spyOn(files, "saveFile").mockImplementation(async (_name, content) => ((saved = content), "Saved"));
  setup();
  await userEvent.click(screen.getByRole("button", { name: "New" }));
  await userEvent.clear(screen.getByLabelText("Project name"));
  await userEvent.type(screen.getByLabelText("Project name"), "Kurs");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(JSON.parse(saved).name).toBe("Kurs");

  await userEvent.click(screen.getByRole("button", { name: "New" }));
  vi.spyOn(files, "pickFile").mockResolvedValue(saved);
  await userEvent.click(screen.getByRole("button", { name: "Load" }));
  expect(screen.getByLabelText("Project name")).toHaveValue("Kurs");

  vi.spyOn(files, "pickFile").mockResolvedValue("{nope");
  await userEvent.click(screen.getByRole("button", { name: "Load" }));
  expect(screen.getByRole("status")).toHaveTextContent(/not valid JSON/);
});

test("Settings switches the design scheme and remembers it", async () => {
  setup();
  await userEvent.click(screen.getByRole("button", { name: "Settings" }));
  await userEvent.selectOptions(screen.getByLabelText("Design"), "classic");
  expect(document.documentElement.dataset.theme).toBe("classic");
  expect(localStorage.getItem("presenter:theme")).toBe("classic");
});

test("Settings remembers the preset folders choice", async () => {
  setup();
  await userEvent.click(screen.getByRole("button", { name: "Settings" }));
  await userEvent.click(screen.getByLabelText(/Use preset folders/));
  expect(localStorage.getItem("presenter:presetFolders")).toBe("1");
  expect((await import("@/lib/files")).usesPresetFolders()).toBe(true);
});
