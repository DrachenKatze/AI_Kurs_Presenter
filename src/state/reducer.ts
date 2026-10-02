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

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return { project: action.project, activeTemplate: standardTemplate(action.project.table.columns) };
    case "updateProject":
      return state.project ? { ...state, project: { ...state.project, ...action.patch } } : state;
    case "setActiveTemplate":
      return { ...state, activeTemplate: action.template };
  }
}
