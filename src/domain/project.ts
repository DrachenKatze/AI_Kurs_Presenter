import type { Project, Template } from "./types";

export function createProject(name: string): Project {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name,
    table: { columns: [], rows: [] },
    presentation: { templateId: "standard", slides: [] },
  };
}

function parse(json: string, what: string, required: Record<string, string>): Record<string, unknown> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error(`Invalid ${what} file: not valid JSON`);
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(`Invalid ${what} file: expected an object`);
  }
  const obj = data as Record<string, unknown>;
  if (obj.version !== 1) throw new Error(`Unsupported ${what} version: ${String(obj.version)}`);
  for (const [key, type] of Object.entries(required)) {
    const ok = type === "array" ? Array.isArray(obj[key]) : typeof obj[key] === type && obj[key] !== null;
    if (!ok) throw new Error(`Invalid ${what} file: "${key}" must be a ${type}`);
  }
  return obj;
}

export function parseProject(json: string): Project {
  const obj = parse(json, "project", { id: "string", name: "string", table: "object", presentation: "object" });
  const { columns, rows } = obj.table as Record<string, unknown>;
  if (!Array.isArray(columns) || !Array.isArray(rows)) {
    throw new Error('Invalid project file: "table" needs columns and rows');
  }
  if (!Array.isArray((obj.presentation as Record<string, unknown>).slides)) {
    throw new Error('Invalid project file: "presentation.slides" must be an array');
  }
  return obj as unknown as Project;
}

export function parseTemplate(json: string): Template {
  return parse(json, "template", { id: "string", name: "string", elements: "array" }) as unknown as Template;
}
