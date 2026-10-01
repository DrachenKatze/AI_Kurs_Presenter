**Append-only log**: Every ambiguity in this document gets a row when resolved (by human or agent). New entries at bottom.


| Date | Ambiguity | Resolution | Resolved By |
|------|-----------|-----------|------------|
| 2026-09-29 | Development strategies documentation incomplete | Added comprehensive explanations for SOLID, YAGNI, KISS, Clean Code, and DRY to Development Strategie.md | Agent || 2026-10-01 | Design.md generates slides from "visible (non-hidden)" rows, but Data View defines no hide feature | Added row hide toggle to Data View (backlog B4) | Agent |
| 2026-10-01 | Template file format not specified | Templates saved as `.json`, also embedded in the project file | Agent |
| 2026-10-01 | Next.js "full-stack" vs. spec "no database/login, local files" | Client-only app, no API routes; static export kept possible | Agent |
| 2026-10-01 | Settings contents undefined | Button placeholder only; contents deferred (backlog E1, P3) | Agent |
| 2026-10-01 | Placeholder ↔ column link could break on column rename | Placeholders reference stable column IDs, not names | Agent |
| 2026-10-01 | Templates stored inside the project file (superseded) | Templates saved as `.json` in a separate Templates folder, shared by all projects; projects saved in a Projects folder. The app runs as a local Next.js server with file-system route handlers (supersedes "client-only, no API routes") | Human |
| 2026-10-01 | Shared templates cannot use project-specific column IDs | Placeholders match columns by name; unmatched placeholders are flagged as missing (supersedes "stable column IDs") | Agent |
| 2026-10-01 | Template saving was P2, but templates no longer persist with the project | Template library (C4) moved to P1 / M4 | Agent |
