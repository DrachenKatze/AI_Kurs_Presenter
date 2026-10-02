import { createProject } from "@/domain/project";
import { standardTemplate } from "@/domain/template";
import { initialState, reducer } from "./reducer";

test("open sets the project and a standard template for its columns", () => {
  const project = createProject("P");
  project.table.columns = [{ id: "c1", name: "Title" }];
  const s = reducer(initialState, { type: "open", project });
  expect(s.project).toBe(project);
  expect(s.activeTemplate?.elements.map((e) => e.columnName)).toEqual(["Title"]);
});

test("updateProject patches the open project, ignored when none is open", () => {
  const s = reducer(initialState, { type: "open", project: createProject("P") });
  expect(reducer(s, { type: "updateProject", patch: { name: "Q" } }).project?.name).toBe("Q");
  expect(reducer(initialState, { type: "updateProject", patch: { name: "Q" } })).toBe(initialState);
});

test("setActiveTemplate replaces the template", () => {
  const t = standardTemplate([]);
  expect(reducer(initialState, { type: "setActiveTemplate", template: t }).activeTemplate).toBe(t);
});
