import { InvalidIdError, jsonStore, type JsonStore } from "./storage";
import { parseProject, parseTemplate } from "@/domain/project";

// Shared logic of the /api/projects and /api/templates handlers.
function jsonRoutes(getStore: () => JsonStore, parse: (json: string) => { id: string }) {
  const fail = (e: unknown) => {
    const bad = e instanceof InvalidIdError || (e instanceof Error && /^(Invalid|Unsupported|Id )/.test(e.message));
    if (!bad) throw e;
    return Response.json({ error: (e as Error).message }, { status: 400 });
  };

  return {
    list: async () => Response.json(await getStore().list()),

    async get(id: string) {
      try {
        const json = await getStore().read(id);
        if (json === null) return Response.json({ error: "Not found" }, { status: 404 });
        return new Response(json, { headers: { "content-type": "application/json" } });
      } catch (e) {
        return fail(e);
      }
    },

    async put(id: string, req: Request) {
      try {
        const json = await req.text();
        const data = parse(json);
        if (data.id !== id) throw new Error("Id mismatch between URL and body");
        await getStore().write(id, JSON.parse(json));
        return Response.json({ id });
      } catch (e) {
        return fail(e);
      }
    },
  };
}

// ponytail: the env vars are read per request so tests can override them; cache if this ever shows up in a profile
const store = (env: string, fallback: string) => () => jsonStore(process.env[env] ?? fallback);

export const projectRoutes = jsonRoutes(store("PROJECTS_DIR", "./data/projects"), parseProject);

export const templateRoutes = jsonRoutes(store("TEMPLATES_DIR", "./data/templates"), (json) => {
  const t = parseTemplate(json);
  if (t.id === "standard") throw new Error("Invalid template: id 'standard' is reserved");
  return t;
});
