# Tasks

Ordered by milestone (see Implementation-Plan.md). A task is done when its code and its test are both done.

## M0 · Setup
- [x] T0.1 Create the Next.js app (TypeScript, App Router, `src/`, Tailwind) in the repo root
- [x] T0.2 Init shadcn/ui and add Button, Tabs, Dialog, Input, Select, DropdownMenu
- [x] T0.3 Add the Design.md colors as theme variables in `globals.css`
- [x] T0.4 Set up Vitest + React Testing Library and add the `npm test` script
- [x] T0.5 Add `.env.example` with `PROJECTS_DIR=./data/projects` and `TEMPLATES_DIR=./data/templates`, and add `data/` to `.gitignore`

## M1 · Domain Core (pure logic, unit-tested)
- [x] T1.1 `types.ts`: Project, DataTable, Template, Slide, SlideElement
- [x] T1.2 `project.ts`: `createProject()`, `parseProject()`, `parseTemplate()` (reject invalid JSON or a wrong version with a clear error)
- [x] T1.3 `markdownTable.ts`: `parseMarkdownTable()` / `toMarkdownTable()`. Test round-trip, escaped pipes, uneven rows, and files with no table.
- [x] T1.4 `table.ts`: add/rename/delete column (delete also removes its cells), add/edit/delete row, `sortRows(columnId, dir)` with numeric-aware comparison
- [x] T1.5 `template.ts`: `standardTemplate(columns)`, `unusedColumns(template, columns)`, `missingColumns(template, columns)` (all matched by column name)
- [x] T1.6 `presentation.ts`: `generateSlides(table, template)`. One slide per visible row, values filled in by column name (empty if missing), new element IDs.

## M2 · Shell & Storage
- [ ] T2.1 `server/storage.ts`: `jsonStore(dir)` with `list()`, `read(id)`, `write(id, data)`. Create the folder if it's missing, and reject IDs that don't match `^[a-z0-9-]+$`. Test on a temp dir, including a path-traversal ID.
- [ ] T2.2 Route handlers `api/projects` and `api/templates` (list, GET, PUT) using `jsonStore`, plus `lib/api.ts` fetch wrappers
- [ ] T2.3 `state/reducer.ts` + `ProjectContext` (project: `Project | null`, activeTemplate). Test the reducer actions.
- [ ] T2.4 `TopBar`: New / Load (picker listing the Projects folder) / Save on the left, Settings (disabled placeholder) on the right
- [ ] T2.5 `Tabs`: Data / Template / Presentation, with `EmptyState` when no project is loaded
- [ ] T2.6 Test: saving a project and then loading it by ID returns the same state

## M3 · Data View
- [ ] T3.1 `DataTable`: render columns and rows, inline cell editing
- [ ] T3.2 Column header menu: rename, delete. Buttons: add column, add row. Delete per row.
- [ ] T3.3 List actions: New list, Load `.md`, Save `.md` (`lib/files.ts`: `downloadFile`, `pickFile`)
- [ ] T3.4 Component test: edit a cell, then add and delete a row and a column

## M4 · Template Designer
- [ ] T4.1 `SlideRenderer`: render elements in percent on a 16:9 box (shared by every view)
- [ ] T4.2 `EditableCanvas`: select, drag to move, corner-resize, Delete key removes the selected element
- [ ] T4.3 `UnusedColumnsSidebar`: drag a column onto the canvas to create a field element
- [ ] T4.4 New projects (and new columns) get the Standard Template
- [ ] T4.5 Template library: New (blank) / Save (to the Templates folder) / Load (list of the Templates folder). Placeholders with missing columns get a warning marker.
- [ ] T4.6 Tests: moving or resizing updates the coordinates, dropping a column removes it from the sidebar, and a template saved from project A loads in project B

## M5 · Presentation (completes P1 MVP)
- [ ] T5.1 Template selector (Standard + every template in the Templates folder, default: Standard) + "New Presentation" button (asks for confirmation if slides already exist)
- [ ] T5.2 `SlideGrid`: thumbnails + reorder with `@dnd-kit/sortable`
- [ ] T5.3 `PresentationRunner`: Fullscreen API, ←/→/click navigation, Esc exits
- [ ] T5.4 Tests: generating creates N slides for N visible rows, reordering changes the order, and keys change the slide
- [ ] T5.5 Manual end-to-end check: new project → `.md` import → template edit + save → generate → present → save → reload → second project uses the same template

## M6 · MVP Complete (P2)
- [ ] T6.1 B3 Sort by column header (ASC/DESC toggle)
- [ ] T6.2 B4 Row drag reorder + hide toggle
- [ ] T6.3 D4 Single Slide Editor: double-click a slide → dialog with `EditableCanvas` on the slide snapshot, plus that row's unmapped columns
- [ ] T6.4 D5 Add a text box and an image upload (PNG/JPG/SVG → data URL, warn if over 2 MB) in the slide editor and the template designer
- [ ] T6.5 Tests for each item above
