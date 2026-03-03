# CampSync Specification

## Overview
CampSync is a zero-login, session-based web application that automatically generates optimal summer camp schedules for multiple children. It prioritizes privacy (no PII, no DB), speed, and smart constraint solving.

## Key Features
1. **Zero-Knowledge Inputs**
   - No names or addresses, just ZIP Code, children's age/grades, and interests.
   - File drop zone for community/friend schedule `.csv`/`.xlsx` files.
   - Blackout dates selector (e.g. for family vacations).
2. **The Constraint Solver (Brain)**
   - **Hard Constraints**: No overlapping dates for the same child.
   - **Soft Constraints (Stress Score)**:
     - Distance penalty: -5 for > 15 minutes drive / > 10 miles from ZIP.
     - Sibling Sync bonus: +10 for same location/time for siblings of different ages.
     - Prioritize Friend Matches from uploaded sheets.
   - **Proactive Gaps**: Suggest high-probability camps for non-blacked-out empty weeks.
3. **Editable Draft Output**
   - Drag-and-drop 10-week interactive calendar grid (June - August).
   - Side-panel chat for natural language edits to the generated JSON draft.

## Technical Architecture
- **Framework**: Next.js App Router (React).
- **Styling**: Tailwind CSS + Lucide Icons for a clean, stitch-inspired UI.
- **State Management**: TanStack Query + React Context / Local Storage for complex nested data without backend persistence.
- **Parsing**: PapaParse for CSV parsing.
- **AI Integration**: Integration ready for Gemini 3 Flash (via MCP) for high-speed chat-based reasoning and schedule modifications.
