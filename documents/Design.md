![[blessing-32x.png]]

**Color Scheme**
1. **Gedämpftes Lila / Violett** (Butten Pressed)
    - **HEX:** `#6f5993`
    - **RGB:** `(111, 89, 147)`
2. **Mintgrün** (Button)
    - **HEX:** `#96f6cb`
    - **RGB:** `(150, 246, 203)`
3. **Hellgelb**
    - **HEX:** `#ffffb1`
    - **RGB:** `(255, 255, 177)`
4. **Hellrosa**
    - **HEX:** `#ffb8d1`
    - **RGB:** `(255, 184, 209)`
5. **Flieder / Hellviolett** (Tab Color)
    - **HEX:** `#d6c5e3`
    - **RGB:** `(214, 197, 227`)

## Programm-Design
### Core Shell & Project State (Foundation)

- **Top Navigation Bar:**
    - Left controls: **New Project**, **Load Project**, **Save Project**.
    - Right control: **Settings**.
- **Global Project Lifecycle:**
    - Three navigation tabs: **Data View**, **Template Designer**, **Presentation View**.
    - Inactive state: When no project is active, all three tabs display an empty
    - Active state: Unlocks all tabs and synchronizes project data across them.
### Tabs

#### Data View - (Data Source)
- **List Management:**
    - Create new empty list.
    - Load list from Markdown (`.md` table).
    - Save list to Markdown (`.md` table).
- **Table Operations:**
    - Add, delete, and rename columns.
    - Add, delete, and reorder/edit rows.
    - Sort table by any column (ASC / DESC).
#### Template View - Template Designer (Layout Engine)

 **Template Management:**
- **Template Actions:**
    - Loads with a built-in **Standard Template** by default.
    - Create a new blank template, save current template, or load an existing template file.
- **Canvas & Elements:**
    - Drag-and-drop element positioning, resizing, and alignment guides.
    - **Dynamic elements:** Data placeholders linked to Table columns from Tab 1.
- **Unused Elements Sidebar:**
    - Displays a list of table columns not currently placed on the canvas for quick drag-and-drop addition.
#### Presentation View

**Generation & Overview:**
    - Template selector (defaults to Standard Template).
    - **New Presentation** button: Generates one snapshot slide per visible (non-hidden) row, injecting row data into dynamic placeholders.
    - Slide overview grid with drag-and-drop reordering.
- **Single Slide Editor (Double-Click on a Slide):**
    - Move, resize, and delete elements for that specific slide only.
    - Add unmapped columns from the slide’s source row.
    - Add ad-hoc text boxes and image uploads.
- **Presentation Mode:**
    - Clean, borderless fullscreen runner with arrow key and click navigation.
