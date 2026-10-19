
## Design Scheme

**Scheme : Night Fox**
Header - RGB: (88, 44, 131)
Button - RGB: (211, 161, 250)
Butten Pressed - RGB: (134, 68, 193)
Tab Color - RGB: (214, 197, 227)

**Scheme : Green Woods**
Header - RGB: (11, 156, 91)
Button - RGB: (150, 246, 203)
Butten Pressed - RGB: (96, 235, 173)
Tab Color - RGB: (215, 247, 233) 

**Scheme :  Classic**
Header - RGB: (82, 101, 105)
Button - RGB: (140, 177, 186)
Butten Pressed - RGB: (110, 139, 145)
Tab Color - RGB: (184, 207, 212) 

**Scheme :  Historical**
Header - RGB: (191, 180, 157)
Button - RGB: (232, 185, 86)
Butten Pressed - RGB: (171, 140, 75)
Tab Color - RGB: (181, 171, 150) 

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
