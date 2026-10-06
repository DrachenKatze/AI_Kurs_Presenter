# Implementation Plan

Based on: MVP-Specs.md, Design.md, Tech Stack.md, Development Strategie.md. Features are listed in MVP-Backlog.md, and the work items in Tasks.md.

## 1. Architecture

- **Next.js full-stack (App Router, TypeScript)**, run locally with `npm run dev` or `npm start`. The UI is a single route `/`. There is no database and no login. Storage is plain `.json` files in **two user folders**:
  - `PROJECTS_DIR` (default `./data/projects`): one file per project.
  - `TEMPLATES_DIR` (default `./data/templates`): one file per template, shared by all projects.
- **Route handlers** read and write these folders with Node `fs`:
  - `GET /api/projects` returns the list, and `GET`/`PUT /api/projects/[id]` load and save one project.
  - `GET /api/templates` returns the list, and `GET`/`PUT /api/templates/[id]` load and save one template.
  - IDs are checked against `^[a-z0-9-]+$` before any file access, to block path traversal.
- **Tailwind + shadcn/ui** for the UI. The Design.md colors are defined once as CSS variables or theme tokens:
  - `--primary` mint `#96f6cb` (button), `--primary-pressed` violet `#6f5993`, `--tab` lilac `#d6c5e3`, `--accent-yellow` `#ffffb1`, `--accent-pink` `#ffb8d1`.
- **State:** one `ProjectContext` built on React `useReducer`, holding the current project and the template being edited. Both are plain serializable objects, so Save is `JSON.stringify` plus a `PUT` request. No extra state library.
- **Drag & drop:** pointer events for moving and resizing on the canvas. `@dnd-kit/sortable` for reordering lists (rows and slides), which also gives keyboard accessibility.
- **Tests:** Vitest + React Testing Library. The domain logic is pure functions, so most tests need no DOM.

## 2. Data Model (`src/domain/types.ts`)

```ts
type Id = string; // crypto.randomUUID()

interface Project {               // → PROJECTS_DIR/<id>.json
  version: 1;
  id: Id;
  name: string;
  table: DataTable;
  presentation: { templateId: Id | 'standard'; slides: Slide[] }; // reference only
}

interface DataTable {
  columns: { id: Id; name: string }[];
  rows: { id: Id; hidden: boolean; cells: Record<Id, string> }[];
}

type ElementKind = 'field' | 'text' | 'image';
interface SlideElement {
  id: Id;
  kind: ElementKind;
  x: number; y: number; w: number; h: number; // percent of a 16:9 slide
  columnName?: string; // kind = 'field'; matched by name, so templates work across projects
  text?: string;   // kind = 'text', or the resolved value in a slide snapshot
  src?: string;    // kind = 'image' (data URL)
  style?: { fontSize: number; bold?: boolean; align?: 'left'|'center'|'right' };
}

interface Template { version: 1; id: Id; name: string; elements: SlideElement[] } // → TEMPLATES_DIR/<id>.json
interface Slide    { id: Id; rowId: Id; elements: SlideElement[] } // a fixed snapshot
```

Key decisions:
- Templates live **outside** projects in a shared folder, so every project can use them. A project stores only the ID of the template it uses.
- Placeholders link to column **names**, because column IDs differ between projects. Placeholders with no matching name are flagged as missing.
- The Standard Template is generated in code from the current columns. It is not a file, so it is always available.
- Slides are snapshots, so a project's presentation still works if its template file is changed or deleted later.
- Positions are stored in **percent**, so one renderer works for thumbnails, the editor, and fullscreen.
- A slide snapshot copies the elements and fills the `text` of field elements with the row value.

## 3. Folder Structure

```
src/
  app/                 page.tsx, layout.tsx, globals.css
    api/projects/      route.ts (list), [id]/route.ts (GET, PUT)
    api/templates/     route.ts (list), [id]/route.ts (GET, PUT)
  server/
    storage.ts         jsonStore(dir): list, read, write + id validation (+ test on a temp dir)
  domain/              pure logic + *.test.ts
    types.ts
    project.ts         createProject, parseProject / parseTemplate (validation)
    markdownTable.ts   parseMarkdownTable, toMarkdownTable
    table.ts           add/remove/rename column, row ops, sortRows
    template.ts        standardTemplate(columns), unusedColumns(template, columns)
    presentation.ts    generateSlides(table, template)
  state/               ProjectContext.tsx, reducer.ts (+ reducer.test.ts)
  lib/api.ts           fetch wrappers for /api/projects and /api/templates
  lib/files.ts         downloadFile, pickFile (browser file I/O for .md import/export)
  components/
    shell/             TopBar, Tabs, EmptyState
    data/              DataTable
    canvas/            SlideRenderer, EditableCanvas, UnusedColumnsSidebar
    presentation/      SlideGrid, SlideEditorDialog, PresentationRunner
```

`EditableCanvas` is shared by the Template Designer and the Single Slide Editor (DRY). `SlideRenderer` is shared by thumbnails, the canvas, and fullscreen.

## 4. Milestones

| # | Milestone | Backlog | Done when |
|---|-----------|---------|-----------|
| M0 | Setup | — | Next.js, Tailwind, shadcn, Vitest run. Theme colors are set. CI or the `npm test` script passes. |
| M1 | Domain core | A1, B2, C1, D1 (logic only) | All pure functions in `domain/` are implemented and unit-tested. |
| M2 | Shell & storage | A1, A2 | Both folders and the API work. New/Load/Save of projects works end to end. Tabs show empty states. |
| M3 | Data View | B1, B2 | Edit the table and import/export `.md`. |
| M4 | Template Designer | C1, C2, C3, C4 | Place, move, and resize column placeholders, then save and load templates in the shared folder. |
| M5 | Presentation | D1, D2, D3 | Generate, reorder, and present fullscreen. **← end-to-end P1 MVP** |
| M6 | MVP complete | B3, B4, D4, D5, C6 | All P2 backlog items. |

Each milestone ends in a working app. Every component and domain module gets a test, following Development Strategie.md.

## 5. Risks

- **Large images bloat the project and template JSON.** Warn when a file is over 2 MB. Image compression is deferred.
- **Single-user, local-only.** The folders sit on the machine running the server. Hosting the app for several users would need per-user storage, which is out of scope for the MVP.
- **Column renames break template matching.** The UI shows missing placeholders clearly. A "remap column" action is added only if users ask for it.
- **Canvas drag/resize UX.** Keep it to moving plus one corner handle. Alignment guides are P3.
- **Project file versioning.** The `version` field is included now, and migrations are added only when the format changes.
