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
  expect(screen.getByRole("button", { name: "Settings" })).toBeDisabled();

  await userEvent.click(screen.getByRole("button", { name: "New" }));
  expect(screen.queryByText(/No project open/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  expect(screen.getByLabelText("Project name")).toHaveValue("New Project");
});
