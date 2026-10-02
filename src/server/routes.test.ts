// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createProject, parseProject } from "@/domain/project";
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

test("templates: the id 'standard' is reserved", async () => {
  const t = { version: 1, id: "standard", name: "S", elements: [] };
  const res = await templateRoutes.put("standard", new Request("http://x", { method: "PUT", body: JSON.stringify(t) }));
  expect(res.status).toBe(400);
});
