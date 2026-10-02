"use client";

import { createContext, useContext, useReducer, type ActionDispatch, type ReactNode } from "react";
import { initialState, reducer, type Action, type State } from "./reducer";

const Ctx = createContext<{ state: State; dispatch: ActionDispatch<[Action]> } | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useProject() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}
