import { standardTemplate } from "@/domain/template";
import type { Project, Template } from "@/domain/types";

export interface State {
  project: Project | null;
  activeTemplate: Template | null; // the template being edited in the Template Designer
}

export type Action =
  | { type: "open"; project: Project } // new or loaded project
  | { type: "updateProject"; patch: Partial<Omit<Project, "id" | "version">> }
  | { type: "setActiveTemplate"; template: Template };

export const initialState: State = { project: null, activeTemplate: null };

const columnNames = (p: Project) => p.table.columns.map((c) => c.name).join("\n");

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return { project: action.project, activeTemplate: standardTemplate(action.project.table.columns) };
    case "updateProject": {
      if (!state.project) return state;
      const project = { ...state.project, ...action.patch };
      // An unedited Standard Template (id 'standard') follows the columns; editing it gives it its own id.
      const follow = state.activeTemplate?.id === "standard" && columnNames(project) !== columnNames(state.project);
      return { project, activeTemplate: follow ? standardTemplate(project.table.columns) : state.activeTemplate };
    }
    case "setActiveTemplate":
      return { ...state, activeTemplate: action.template };
  }
}
