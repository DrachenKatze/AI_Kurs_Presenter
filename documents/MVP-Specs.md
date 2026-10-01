
**Core idea**
The User have a table of Data he wants to use for creating a presentation.
He is loading or writing his table, choosing or creating a Design and use this to let the Tool create a Präsentation out of it.

**Core functionality/ Workflow**
1. The User Create a New Project or Load an Existing Project
2. User observe the Tab Data_View
	1. He can load a Table from an md File or he creates a new List
	2. He Edit the List, enter new Items or delete Items
3. User observe the Template_View Tab
	1. There he can Load a Template or Create a new Template
	2. At the Template he can Rearrange Items
	3. After Editing he Saves his Template
4. User observe the Presentation_View
	1. The Präsentation View is Empty
	2. The User can chose a Design, standard is selected by Default
	3. The he can create a new Presentation
		1. The Programm creates for every Item in the Table from Data_view a new Slide
		2. The User can rearrange the Slides
		3. The User can Start a Presentation by Clicking on Button Start Präsentation

**Finalized Specification**
- **Client-side Local Storage:** Projects save to and load from local `.json` project files (containing project metadata, table lists, templates, and slide decks). No database or login required.
- **Image Assets:** Local image file uploads (PNG, JPG, SVG) embedded directly into the project bundle (data URLs/base64).
- **Slide Lifecycle:** Fixed snapshots. Once generated from a template, slides maintain their own layout and element states so single-slide manual edits remain intact. Regenerating via "New Presentation" recreates the deck.