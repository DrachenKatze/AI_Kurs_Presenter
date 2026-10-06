import { parseProject, parseTemplate } from "@/domain/project";
import type { Template } from "@/domain/types";

export interface ListItem {
  id: string;
  name: string;
}

// Projects and templates live in the browser's localStorage, one `presenter:<kind>:<id>` key per item.
// ponytail: localStorage caps at ~5 MB per origin (uploaded images count); move to IndexedDB if users hit it
function store<T extends { id: string; name: string }>(kind: string, parse: (json: string) => T) {
  const prefix = `presenter:${kind}:`;
  return {
    async list(): Promise<ListItem[]> {
      const items: ListItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        if (!key.startsWith(prefix)) continue;
        try {
          const { id, name } = parse(localStorage.getItem(key)!);
          items.push({ id, name });
        } catch {
          // ponytail: unreadable entries are skipped silently; surface them in the UI if users hit this
        }
      }
      return items.sort((a, b) => a.name.localeCompare(b.name));
    },
    async load(id: string): Promise<T> {
      const json = localStorage.getItem(prefix + id);
      if (json === null) throw new Error("Not found");
      return parse(json);
    },
    async save(item: T): Promise<void> {
      localStorage.setItem(prefix + item.id, JSON.stringify(item));
    },
  };
}

const projects = store("project", parseProject);
const templates = store("template", parseTemplate);

export const listProjects = projects.list;
export const loadProject = projects.load;
export const saveProject = projects.save;

export const listTemplates = templates.list;
export const loadTemplate = templates.load;
export const saveTemplate = async (t: Template) => {
  if (t.id === "standard") throw new Error("Invalid template: id 'standard' is reserved");
  return templates.save(t);
};
