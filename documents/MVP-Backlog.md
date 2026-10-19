# MVP Backlog

Priority: **P1** = MVP core (the end-to-end workflow), **P2** = MVP complete (spec features that polish the workflow), **P3** = after MVP.

The P1 slice alone delivers the core promise: *table in → presentation out*.

---

## Epic A — Project Foundation

### A1 · Project Lifecycle (New / Load / Save) — P1
- **Feature name:** Project Lifecycle
- **User problem:** I want to keep my work and continue later without an account or server.
- **Expected outcome:** Each project is one `.json` file (metadata, table, slides, images) on my own computer. Templates are not stored in it; they live in the template library (C4).
- **Short description:** Top bar buttons New / Load / Save. Save asks for a name and downloads `<name>.json`. Load opens the file dialog and validates the chosen file. New starts an empty project that uses the Standard Template. A default save folder is added later (E3).

### A2 · App Shell & Tab Navigation — P1
- **Feature name:** App Shell & Tabs
- **User problem:** I need a clear path through the workflow: Data → Template → Presentation.
- **Expected outcome:** Three tabs show the same project. Without a project, each tab shows an empty state that asks me to create or load one.
- **Short description:** Top navigation bar with the three tabs and a Settings button (opens E1). The colors come from the active design scheme (E2).

---

## Epic B — Data View

### B1 · Table Editor — P1
- **Feature name:** Table Editor
- **User problem:** I need to enter and fix the data my slides are built from.
- **Expected outcome:** I can create a new list, then add, rename, and delete columns and add, edit, and delete rows directly in the table.
- **Short description:** Editable grid with inline cell editing. Templates match columns by name, so after a rename the affected placeholders show as missing until the template is updated.

### B2 · Markdown Table Import / Export — P1
- **Feature name:** Markdown Import / Export
- **User problem:** My data already exists as a Markdown table, and I want to reuse it outside the tool.
- **Expected outcome:** Loading a `.md` file with a table fills the Data View. Saving writes a valid `.md` table.
- **Short description:** Parser and serializer for GitHub-style pipe tables (header row, separator row, escaped `\|`). Clear error message for files without a table.

### B3 · Sort by Column — P2
- **Feature name:** Column Sorting
- **User problem:** I want my slides in a meaningful order (alphabetical, by date, by rank).
- **Expected outcome:** Clicking a column header sorts the rows ASC/DESC. Number-like values sort as numbers.
- **Short description:** Sorting changes the row order in the stored table, and generated slides use that order.

### B4 · Row Reorder & Hide — P2
- **Feature name:** Row Reorder & Visibility
- **User problem:** Some rows shouldn't become slides, and I want to control their order by hand.
- **Expected outcome:** Rows can be dragged into a new order and hidden. Only visible rows produce slides.
- **Short description:** Drag handle and visibility toggle per row (needed for the "visible rows" rule in Design.md).

---

## Epic C — Template Designer

### C1 · Standard Template — P1
- **Feature name:** Standard Template
- **User problem:** I want a working result before I spend time on design.
- **Expected outcome:** Every project starts with a template that places the first column as a title and the next columns as body text.
- **Short description:** Built-in template generated from the current columns. It is always available in the template selector.

### C2 · Canvas with Drag & Resize — P1
- **Feature name:** Template Canvas
- **User problem:** I want to decide where each piece of data appears on a slide.
- **Expected outcome:** I can move and resize elements on a 16:9 canvas, and the layout looks the same in fullscreen.
- **Short description:** Elements are positioned in percent of the slide, so they scale to any size. Pointer-based dragging and corner resize handles.

### C3 · Column Placeholders & Unused-Elements Sidebar — P1
- **Feature name:** Data Placeholders
- **User problem:** I need to link slide elements to my table columns.
- **Expected outcome:** A sidebar lists the columns not yet on the canvas. Dragging one onto the canvas creates a placeholder that later shows that row's value.
- **Short description:** Placeholders reference the column **name**, so the same template works in any project that has those columns. Removing a placeholder from the canvas puts the column back in the sidebar. A placeholder with no matching column is marked as missing and stays empty on slides.

### C4 · Shared Template Library (New / Save / Load) — P1
- **Feature name:** Template Library
- **User problem:** I want to reuse my designs in all my projects, not just the one where I made them.
- **Expected outcome:** Templates are saved in the browser's template library (localStorage), outside any project. Every project can load any saved template.
- **Short description:** New (blank), Save (to the library), and Load (a list of the saved templates). It is P1 because templates are no longer saved with the project, so without this a designed template would be lost.

### C5 · Alignment Guides — P3
- **Feature name:** Alignment Guides
- **User problem:** Lining up elements by eye is fiddly.
- **Expected outcome:** Elements snap to the slide center and to the edges of other elements.
- **Short description:** Snap lines shown while dragging.

### C6 · Save Template As / Overwrite Warning — P2
- **Feature name:** Save Template As
- **User problem:** I want to save a variant of a template under a new name, and I don't want to overwrite another template by accident.
- **Expected outcome:** "Save as…" asks for a name and saves a new template file. If the name (trimmed, case-insensitive) already belongs to another saved template, both Save and Save as ask "Overwrite template?". Yes overwrites that file, No goes back without saving.
- **Short description:** Source: `documents/Fix/Save Template as new File.md`. The name check uses the Templates folder list, so no new API is needed.

---

## Epic D — Presentation

### D1 · Generate Presentation — P1
- **Feature name:** Generate Presentation
- **User problem:** I don't want to build one slide per item by hand.
- **Expected outcome:** Clicking "New Presentation" creates one slide for each visible row, using the selected template (Standard by default).
- **Short description:** Each slide is a fixed snapshot: the template's elements are copied and the row values filled in. Regenerating replaces the deck, after the user confirms.

### D2 · Slide Overview & Reorder — P1
- **Feature name:** Slide Overview
- **User problem:** I want to see the whole deck and change the order.
- **Expected outcome:** A grid of slide thumbnails that I can reorder with drag and drop.
- **Short description:** Thumbnails use the same slide renderer as the editor and the fullscreen view, scaled down.

### D3 · Fullscreen Presentation Mode — P1
- **Feature name:** Presentation Mode
- **User problem:** I need to actually present the slides.
- **Expected outcome:** "Start Presentation" opens a clean, borderless fullscreen view. Arrow keys or a click go to the next or previous slide, and Esc exits.
- **Short description:** Uses the browser Fullscreen API with the shared slide renderer.

### D4 · Single Slide Editor — P2
- **Feature name:** Single Slide Editor
- **User problem:** One slide needs a special tweak that shouldn't change all the others.
- **Expected outcome:** Double-clicking a slide opens it in an editor where I can move, resize, and delete elements for that slide only, and add columns from its row that aren't mapped yet.
- **Short description:** Reuses the template canvas component, but edits the slide snapshot instead of the template.

### D5 · Ad-hoc Text & Image Elements — P2
- **Feature name:** Free Text & Images
- **User problem:** I want to add a comment or a picture to a slide.
- **Expected outcome:** I can add text boxes and upload PNG, JPG, or SVG images to a slide (and to templates). Images are saved inside the project or template file.
- **Short description:** Images are stored as base64 data URLs. A size warning appears for very large files.

---

## Epic E — Settings

### E1 · Settings Dialog — P2
- **Feature name:** Settings
- **User problem:** I need one place to set how the app looks and where my files go.
- **Expected outcome:** The Settings button in the top bar opens a dialog with two options: Design (E2) and Save Folder (E3). My choices are still set when I reopen the app.
- **Short description:** The button in A2 is now enabled. Settings are stored in localStorage and are not part of the project file, because they belong to the user, not to the project.

### E2 · Design Scheme Selector — P2
- **Feature name:** Design Selector
- **User problem:** I want to change the colors of the app to my taste.
- **Expected outcome:** In Settings I choose one of four schemes: **Night Fox**, **Green Woods**, **Classic**, **Historical**. The header, buttons, pressed buttons, and tabs change color right away.
- **Short description:** Source: `documents/Fix/Design Selector.md`, colors in Design.md → *Design Scheme*. Each scheme sets the existing theme variables (`--primary`, `--primary-pressed`, `--tab`, plus a new `--header`) through a `data-theme` attribute on `<html>`, so components don't change. The header currently has a fixed color (`bg-[#6f5993]` in TopBar) and must use `--header`. Default scheme: Night Fox.

### E3 · Default Save Folder — P2
- **Feature name:** Default Save Folder
- **User problem:** Every saved file ends up in my Downloads folder, and I have to move it by hand.
- **Expected outcome:** In Settings I pick a folder on my hard drive. From then on, every save (project `.json`, Markdown list `.md`) goes straight into that folder. Without a chosen folder, saving works as before (download).
- **Short description:** Source: `documents/Fix/Set Save Folder.md`. Uses the browser's File System Access API (`showDirectoryPicker`). The folder handle is stored in IndexedDB, because localStorage can't store it. Limits: only Chromium browsers (Chrome, Edge) support this, so Firefox and Safari fall back to download. The browser may ask for permission again after a restart.
