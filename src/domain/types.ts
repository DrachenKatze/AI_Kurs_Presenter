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

export type ElementKind = "field" | "text" | "image" | "timer"; // timer: the countdown of its slide, always in front

export interface SlideElement {
  id: Id;
  kind: ElementKind;
  x: number; // percent of a 16:9 slide
  y: number;
  w: number;
  h: number;
  rotation?: number; // degrees clockwise around the centre
  columnName?: string; // kind = 'field'; matched by name so templates work across projects
  text?: string; // kind = 'text', or the resolved value in a slide snapshot
  src?: string; // kind = 'image' (data URL)
  style?: TextStyle;
}

export interface TextStyle {
  fontSize: number;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  color?: string; // CSS colour, default black
  font?: string; // font family, default the app font
  effect?: "shadow" | "glow";
  effectColor?: string;
  gradient?: { from: string; to: string; angle: number }; // fills the letters instead of color
}

export interface Slide {
  id: Id;
  rowId: Id;
  elements: SlideElement[]; // fixed snapshot
  background?: Background;
  timer?: number; // seconds until the runner moves on; shown only if the slide has a timer element
}

export type Background =
  | { kind: "color"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number } // CSS angle, 90 = left to right
  | { kind: "image"; src: string }; // data URL, covers the slide

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
  background?: Background; // copied to every generated slide
}
