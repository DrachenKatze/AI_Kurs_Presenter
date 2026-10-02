export type Id = string; // crypto.randomUUID()

export interface Column {
  id: Id;
  name: string;
}

export interface Row {
  id: Id;
  hidden: boolean;
  cells: Record<Id, string>;
}

export interface DataTable {
  columns: Column[];
  rows: Row[];
}

export type ElementKind = "field" | "text" | "image";

export interface SlideElement {
  id: Id;
  kind: ElementKind;
  x: number; // percent of a 16:9 slide
  y: number;
  w: number;
  h: number;
  columnName?: string; // kind = 'field'; matched by name so templates work across projects
  text?: string; // kind = 'text', or the resolved value in a slide snapshot
  src?: string; // kind = 'image' (data URL)
  style?: { fontSize: number; bold?: boolean; align?: "left" | "center" | "right" };
}

export interface Slide {
  id: Id;
  rowId: Id;
  elements: SlideElement[]; // fixed snapshot
}

export interface Project {
  version: 1;
  id: Id;
  name: string;
  table: DataTable;
  presentation: { templateId: Id | "standard"; slides: Slide[] };
}

export interface Template {
  version: 1;
  id: Id;
  name: string;
  elements: SlideElement[];
}
