import { parseProject, parseTemplate } from "@/domain/project";
import type { Project, Template } from "@/domain/types";

export interface ListItem {
  id: string;
  name: string;
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? res.statusText);
  }
  return res;
}

const put = (url: string, data: unknown) =>
  request(url, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });

export const listProjects = async (): Promise<ListItem[]> => (await request("/api/projects")).json();
export const loadProject = async (id: string): Promise<Project> =>
  parseProject(await (await request(`/api/projects/${id}`)).text());
export const saveProject = (p: Project) => put(`/api/projects/${p.id}`, p);

export const listTemplates = async (): Promise<ListItem[]> => (await request("/api/templates")).json();
export const loadTemplate = async (id: string): Promise<Template> =>
  parseTemplate(await (await request(`/api/templates/${id}`)).text());
export const saveTemplate = (t: Template) => put(`/api/templates/${t.id}`, t);
