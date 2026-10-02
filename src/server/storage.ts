import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ID = /^[a-z0-9-]+$/;

export class InvalidIdError extends Error {
  constructor(id: string) {
    super(`Invalid id: ${id}`);
  }
}

const check = (id: string) => {
  if (!ID.test(id)) throw new InvalidIdError(id);
};

/** One `<id>.json` file per item in `dir`. The folder is created on first use. */
export function jsonStore(dir: string) {
  const file = (id: string) => {
    check(id);
    return path.join(dir, `${id}.json`);
  };

  return {
    async list(): Promise<{ id: string; name: string }[]> {
      await mkdir(dir, { recursive: true });
      const items: { id: string; name: string }[] = [];
      for (const f of await readdir(dir)) {
        const id = f.replace(/\.json$/, "");
        if (!f.endsWith(".json") || !ID.test(id)) continue;
        try {
          const { name } = JSON.parse(await readFile(path.join(dir, f), "utf8"));
          items.push({ id, name: typeof name === "string" ? name : id });
        } catch {
          // ponytail: unreadable files are skipped silently; surface them in the UI if users hit this
        }
      }
      return items.sort((a, b) => a.name.localeCompare(b.name));
    },

    /** Raw JSON text, or null if there is no such item. */
    async read(id: string): Promise<string | null> {
      try {
        return await readFile(file(id), "utf8");
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw e;
      }
    },

    async write(id: string, data: unknown): Promise<void> {
      const target = file(id);
      await mkdir(dir, { recursive: true });
      await writeFile(target, JSON.stringify(data, null, 2), "utf8");
    },
  };
}

export type JsonStore = ReturnType<typeof jsonStore>;
