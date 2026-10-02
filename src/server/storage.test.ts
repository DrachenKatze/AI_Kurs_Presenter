// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { InvalidIdError, jsonStore } from "./storage";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "store-"));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

test("write → read → list; creates a missing folder", async () => {
  const store = jsonStore(path.join(dir, "not", "yet"));
  expect(await store.list()).toEqual([]);
  await store.write("abc-1", { name: "First" });
  expect(JSON.parse((await store.read("abc-1"))!)).toEqual({ name: "First" });
  expect(await store.list()).toEqual([{ id: "abc-1", name: "First" }]);
});

test("read of an unknown id returns null", async () => {
  expect(await jsonStore(dir).read("nope")).toBeNull();
});

test.each(["../evil", "..\evil", "a/b", "A", "", "a.json"])("rejects id %j", async (id) => {
  const store = jsonStore(dir);
  await expect(store.read(id)).rejects.toBeInstanceOf(InvalidIdError);
  await expect(store.write(id, {})).rejects.toBeInstanceOf(InvalidIdError);
});
