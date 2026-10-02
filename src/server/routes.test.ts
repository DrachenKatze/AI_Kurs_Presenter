// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createProject, parseProject, parseTemplate } from "@/domain/project";
import { missingColumns, standardTemplate, unusedColumns } from "@/domain/template";
import { initialState, reducer } from "@/state/reducer";
import { projectRoutes, templateRoutes } from "./routes";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "routes-"));
  process.env.PROJECTS_DIR = path.join(dir, "projects");
  process.env.TEMPLATES_DIR = path.join(dir, "templates");
});
afterEach(() => rm(dir, { recursive: true, force: true }));

const put = (id: string, body: unknown) =>
  projectRoutes.put(id, new Request("http://x", { method: "PUT", body: JSON.stringify(body) }));

test("saving a project and loading it by id returns the same state", async () => {
  const project = createProject("Demo");
  project.table = { columns: [{ id: "c1", name: "Title" }], rows: [{ id: "r1", hidden: false, cells: { c1: "Hi" } }] };

  expect((await put(project.id, project)).status).toBe(200);
  expect(await (await projectRoutes.list()).json()).toEqual([{ id: project.id, name: "Demo" }]);

  const loaded = parseProject(await (await projectRoutes.get(project.id)).text());
  expect(loaded).toEqual(project);
  expect(reducer(initialState, { type: "open", project: loaded }).project).toEqual(project);
});

test("404 for unknown id, 400 for bad id / body / mismatched id", async () => {
  expect((await projectRoutes.get("missing")).status).toBe(404);
  expect((await projectRoutes.get("../etc")).status).toBe(400);
  expect((await put("abc", { nope: true })).status).toBe(400);
  expect((await put("other-id", createProject("x"))).status).toBe(400);
});

test("a template saved from project A loads in project B, matched by column name", async () => {
  const a = standardTemplate([
    { id: "a1", name: "Title" },
    { id: "a2", name: "Author" },
  ]);
  a.id = "tpl-1";
  const body = JSON.stringify(a);
  expect((await templateRoutes.put("tpl-1", new Request("http://x", { method: "PUT", body }))).status).toBe(200);
  expect(await (await templateRoutes.list()).json()).toEqual([{ id: "tpl-1", name: "Standard" }]);

  const loaded = parseTemplate(await (await templateRoutes.get("tpl-1")).text());
  expect(loaded).toEqual(a);
  const columnsOfB = [{ id: "b9", name: "Title" }];
  expect(missingColumns(loaded, columnsOfB)).toEqual(["Author"]);
  expect(unusedColumns(loaded, [...columnsOfB, { id: "b10", name: "Year" }]).map((c) => c.name)).toEqual(["Year"]);
});

test("templates: the id 'standard' is reserved", async () => {
  const t = { version: 1, id: "standard", name: "S", elements: [] };
  const res = await templateRoutes.put("standard", new Request("http://x", { method: "PUT", body: JSON.stringify(t) }));
  expect(res.status).toBe(400);
});
