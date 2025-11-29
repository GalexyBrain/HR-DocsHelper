# Knowledge Base Agent – Next.js Frontend Design Document

## 1. Project Overview

**Project Name:** Knowledge Base Agent – Company Document Q&A
**Frontend Framework:** Next.js (App Router) + React
**Backend:** Existing Flask/Gemini-based API from `Notebook` repo (extended for KB Q&A)
**Goal:**
Provide a modern web interface where users can:

1. Upload company documents (PDF, DOCX, TXT, etc.).
2. Organize them into Knowledge Bases (KBs).
3. Ask natural language questions.
4. Get grounded answers with citations pointing back to the original documents.

This document describes the **pages**, **layouts**, and **interactions** for the Next.js frontend. It is **implementation-agnostic** (no code, no routes), and focuses on structure, UX, and data flow.

---

## 2. User Roles & High-Level Flows

### 2.1 User Roles (logical only)

* **Standard User**

  * Upload documents (if allowed).
  * View documents they have access to.
  * Ask questions in selected Knowledge Bases.
  * View answers with citations.

* **Admin User**

  * Everything a standard user can do.
  * Manage Knowledge Bases.
  * Manage users and permissions.
  * View analytics and system-level settings.

*(Roles are enforced by backend; frontend just shows/hides options based on flags from backend.)*

### 2.2 Core User Flows

1. **Ingestion Flow**

   * Go to **Upload** → select files → add metadata (KB, tags) → submit → see progress on **Documents** or **KB** pages.

2. **Organization Flow**

   * Go to **KB** → create new KB → attach existing documents → manage visibility/tags.

3. **Question-Answer Flow**

   * Go to **Ask** → choose KB → ask question → see answer + citations → open underlying docs.

4. **Search Flow**

   * Go to **Search** → type query + filters → see ranked document/snippet results → open in viewer.

5. **Admin & Monitoring Flow**

   * Go to **Admin** / **Analytics** → inspect usage, logs, and system configurations.

---

## 3. Information Architecture & Navigation

### 3.1 Main Navigation (Top or Sidebar)

Global navigation items:

* **Home** (`/`)
* **Upload** (`/upload`)
* **Documents** (`/documents`)
* **Knowledge Bases** (`/kb`)
* **Ask** (`/ask`)
* **Search** (`/search`)
* **Analytics** (`/analytics`) – visible to Admin
* **Admin** (`/admin`) – visible to Admin
* **API & Integrations** (`/settings/api`) – visible to Admin
* **Profile / Auth** (dropdown or separate pages later)

---

## 4. Next.js Page Structure (App Router)

Logical mapping (no code, just conceptual):

* `app/page.tsx` → `/` (Landing)
* `app/upload/page.tsx` → `/upload`
* `app/documents/page.tsx` → `/documents`
* `app/documents/[id]/page.tsx` → `/documents/[id]`
* `app/kb/page.tsx` → `/kb`
* `app/kb/[id]/page.tsx` → `/kb/[id]`
* `app/ask/page.tsx` → `/ask`
* `app/search/page.tsx` → `/search`
* `app/analytics/page.tsx` → `/analytics`
* `app/admin/page.tsx` → `/admin`
* `app/settings/api/page.tsx` → `/settings/api`
* (Optional) `app/auth/login/page.tsx`, `app/auth/register/page.tsx`

You can adapt names, but conceptually these are the screens you will build.

---

## 5. Page-by-Page Detailed Plan

### 5.1 `/` – Landing Page

**Purpose:**
Introduce the Knowledge Base Agent and provide clear entry points for **uploading documents** and **asking questions**.

**Target Users:**

* First-time users
* Returning users who want quick access

**Sections:**

1. **Hero Section**

   * Short headline: e.g., “Ask questions directly from your company documents.”
   * Subtext describing core value (no marketing fluff, just clarity).
   * Primary CTA: “Upload Documents” (link to `/upload`).
   * Secondary CTA: “Ask a Question” (link to `/ask`).

2. **How It Works Section**

   * Three-step horizontal layout:

     1. Upload Documents
     2. Build Knowledge Bases
     3. Ask Questions with Citations
   * Very short descriptions under each.

3. **Quick Demo Block (Optional)**

   * Simple input to try a sample question against demo docs (public KB).
   * On submit, either:

     * Show a canned response, or
     * Navigate to `/ask` with prefilled question & demo KB selected.

4. **Footer**

   * Links: Docs, Privacy, Contact, GitHub repo.

**Backend Integration (Conceptual):**

* Read-only info: might fetch stats like “Documents indexed”, “KBs available” for display.
* No heavy API dependency here; page should load even if backend is down.

---

### 5.2 `/upload` – Document Upload Page

**Purpose:**
Enable users to upload new documents and kick off ingestion & embedding.

**Core Elements:**

11. **Upload Panel**

   * Drag-and-drop zone and “Browse files” button.
   * Supports multiple files.
   * Allowed file types: PDF, DOCX, TXT (configurable).

12. **Metadata Form**

   * Select Knowledge Base (dropdown).
   * Tags field (free text or multi-select).
   * Visibility options (e.g., Private / Team / Org) – depending on backend.

13. **Upload Queue List**

   * For each selected file:

     * File name, size, type.
     * Selected KB and tags.
     * Remove/cancel option before final submission.

14. **Upload Status Area**

   * Once submitted:

     * Per-file status: `Uploading`, `Processing`, `Embedding`, `Ready`, `Failed`.
     * Progress indicator (percentage or simple state badges).

15. **Post-Upload Actions**

   * Button: “View Documents” → `/documents`
   * Button: “Go to KB” (if a specific KB was selected) → `/kb/[id]`

**Expected Data (Frontend <-> Backend shape idea):**

* **Request payload (conceptual):**

  * File binary
  * `kb_id`
  * `tags: string[]`
  * `visibility: string`

* **Response payload example:**

  * `document_id`
  * `status` (initially `queued` or `processing`)

* **Status polling (conceptual):**

  * For each `document_id`, periodically fetch status until `ready` or `failed`.

---

### 5.3 `/documents` – Document Manager

**Purpose:**
Manage and view all documents accessible to the user.

**Layout:**

1. **Header**

   * Title: “Documents”
   * Filters:

     * Knowledge Base (dropdown)
     * Status (Processing / Ready / Failed)
     * File type (PDF/DOCX/TXT)
     * Search by name

2. **Documents Table / Grid**

   * Columns:

     * Document Name
     * Knowledge Base
     * Type
     * Status
     * Last Updated
     * Actions

3. **Actions per Row**

   * **View** → Navigates to `/documents/[id]`
   * **Reprocess** → Re-run extraction/embedding if allowed
   * **Delete** → Mark for deletion (with confirmation dialog)

4. **Pagination**

   * Standard pagination or “Load more” style.

**Data expectations:**

Each document record may include:

* `id`
* `name`
* `kb_id` and `kb_name`
* `file_type`
* `status`
* `created_at`
* `updated_at`
* `tags: string[]`

---

### 5.4 `/documents/[id]` – Document Viewer & Citations

**Purpose:**
Show the original document and highlight the sections used for answers.

**Layout:**

1. **Header**

   * Document title
   * KB badge
   * Tags
   * Status indicator

2. **Main Content Split View**

   * **Left:** Document viewer (embedded PDF / text viewer).
   * **Right:** Sidebar with:

     * Metadata (size, type, upload date).
     * “Chunks used in recent answers” list.
     * Quick actions: Reprocess, Download.

3. **Highlights Integration**

   * When opened via “View Source” from `/ask`:

     * Display a list of “Relevant Excerpts” with:

       * Short snippet
       * “Jump to location” button
     * Clicking should scroll/jump the viewer to the page/region used for that snippet.

**Data expectations:**

* Document metadata.
* Viewer URL or rendered content.
* Optional: list of `recent_excerpts` such as:

  * `page_number`
  * `text_snippet`
  * `char_start`, `char_end` (for highlight mapping)

---

### 5.5 `/kb` – Knowledge Bases Overview

**Purpose:**
Let users see and manage all Knowledge Bases.

**Layout:**

1. **Header**

   * Title: “Knowledge Bases”
   * Button: “Create Knowledge Base”

2. **KB Cards / Table**
   For each KB:

   * Name
   * Description
   * Number of documents
   * Visibility (Private/Team/Org)
   * Created by / Owner
   * Actions: “Open”, “Edit”, “Delete” (delete only for owners/admins)

3. **Create/Edit KB Modal/Page**

   * Fields:

     * KB Name
     * Description
     * Default visibility
   * On save: backend returns `kb_id`.

---

### 5.6 `/kb/[id]` – Single Knowledge Base Page

**Purpose:**
Manage documents and settings for one KB.

**Sections:**

1. **KB Header**

   * KB Name, description
   * Visibility info
   * Owner, created date
   * Buttons:

     * Edit KB
     * Add Documents (opens `/upload` with this KB preselected)

2. **Documents in This KB**

   * Table similar to `/documents` but filtered to this KB.
   * Actions: View, Remove from KB (if allowed).

3. **KB Stats (Optional)**

   * Number of chunks indexed.
   * Last index/refresh date.
   * Common tags.

---

### 5.7 `/ask` – Ask / Chat Interface (Main Agent Page)

**Purpose:**
Provide the core Q&A experience over selected Knowledge Bases.

**Layout:**

1. **Header Bar**

   * Title: “Ask the Knowledge Base”
   * KB Selector (dropdown to pick context KB; may allow “All accessible KBs”).
   * Indicator of currently selected KB.

2. **Main Chat Area**

   * Conversation view:

     * User messages (questions).
     * Agent messages (answers).
   * Show previous questions & answers in the session.

3. **Answer Structure**
   Each agent response shows:

   * Final answer text.
   * “Sources” section:

     * List of cited documents with:

       * Document Name
       * KB Name
       * Page/section info
       * Button: “Open Document” → `/documents/[id]` with highlight info.

4. **Input Box**

   * Text area with:

     * Placeholder: “Ask a question about your documents…”
     * Send button.
   * Optional: attach doc for one-off context (if supported later).

5. **Session Controls**

   * “New conversation” button to clear context.
   * Label showing which conversation ID/session is active (for debugging/UX clarity).

**Request/Response expectations (conceptual):**

* **Request to backend:**

  * `question`
  * `kb_id` or list of KBs
  * `conversation_id` (if continuing)

* **Response from backend:**

  * `answer`
  * `sources: [ { document_id, kb_id, snippet, page, score } ]`
  * `conversation_id` (for subsequent turns)

---

### 5.8 `/search` – Advanced Search

**Purpose:**
Allow users to perform semantic + keyword search over documents and KBs.

**Layout:**

1. **Header**

   * Title: “Search”
   * Explanation: “Search across all indexed documents and Knowledge Bases.”

2. **Search Controls**

   * Main search input.
   * Filters:

     * KB selector
     * File type
     * Date range
     * Tags

3. **Results List**
   For each result:

   * Document name
   * Snippet with highlighted match
   * KB name
   * Score or relevance indicator
   * Actions:

     * “Open Document” → `/documents/[id]`
     * “Open in Ask” → `/ask` with question prefilled and context set

4. **Pagination**

   * Standard page or infinite scroll.

---

### 5.9 `/analytics` – Usage Analytics Dashboard

**Purpose:**
Give admins visibility into usage and performance.

**Metrics (display-only frontend):**

* Number of queries per day.
* Average response time.
* Most queried KBs.
* Most used documents (as sources).
* Breakdown: Success vs “I don’t know” responses (if backend provides).

**UI Elements:**

* Line chart for queries over time.
* Bar chart for top KBs.
* Table of top queries and their frequency.

---

### 5.10 `/admin` – Admin Panel

**Purpose:**
Admin-only management and configuration.

**Sections (can be tabs):**

1. **User Management**

   * List of users
   * Role (User/Admin)
   * Status
   * Actions: Promote/demote, deactivate (if supported).

2. **Knowledge Base Controls**

   * Quick overview of all KBs with ability to change visibility.

3. **System Settings**

   * Model selection (e.g., which LLM/embedding model name to show).
   * Limits (max documents per KB, max question length) – display only if backend supplies.

---

### 5.11 `/settings/api` – API & Integrations Page

**Purpose:**
Expose API keys and integration instructions.

**Sections:**

1. **API Keys**

   * List existing keys (masked).
   * Generate new key button.
   * Revoke key button (with confirmation).

2. **Integration Examples**

   * Code snippets (shown as read-only text) in:

     * cURL
     * JavaScript
     * Python
   * Each example demonstrates:

     * How to call the Ask endpoint with `question` and `kb_id`.
     * How to read `answer` and `sources`.

3. **Webhook / Bot Config (Optional)**

   * Fields for Slack/Teams webhook URLs.
   * Toggles for enabling/disabling.

---

## 6. Shared Layout & Components

### 6.1 Global Layout

* **Top-level Layout:**

  * App-wide header with logo and navigation links.
  * Optional left sidebar for navigation in desktop view.
  * Main content area with consistent padding.
  * Responsive design for mobile/desktop.

### 6.2 Reusable Components (Conceptual List)

* `LayoutShell` – wraps pages with header/nav.
* `PageHeader` – title, subtitle, actions.
* `DataTable` – generic paginated table.
* `StatusBadge` – for document/KB statuses.
* `KBSelector` – dropdown to choose KB.
* `UploadDropzone` – for file selection.
* `ChatWindow` – message list + input.
* `SourceList` – list of citations.
* `TagPill` – for displaying tags.
* `StatsCard` – small cards in analytics.

---

## 7. State Management Strategy

* **Local State:**
  UI-specific things like open modals, current filters, whether a sidebar is collapsed.

* **Server/Remote State:**

  * Documents list, KB list, analytics, chat history (per session).
  * Fetched via backend APIs.
  * Cached using a data-fetching mechanism (e.g., React Query / Next fetch patterns) – details implementation-specific.

* **Session State for Ask Page:**

  * Keep `conversation_id` in memory or URL param so refreshing doesn’t lose context (optional).
  * Maintain array of messages (user/assistant) as returned by backend.

---

## 8. Error & Loading States (Frontend Behavior)

For all pages:

* **Loading State:**

  * Skeletons or spinners while data is being fetched.
  * Clear messages like “Loading documents…” rather than blank screens.

* **Error State:**

  * User-friendly message when backend fails:

    * “We couldn’t load your documents. Try again later.”
  * Option to retry the request.
  * For Ask page, clearly show when the model refused or had no evidence and show the retrieved sources (if any).

* **Empty State:**

  * No documents: “No documents uploaded yet. Start by uploading some on the Upload page.”
  * No KBs: “No Knowledge Bases found. Create one to get started.”
  * No search results: “No matches found. Try adjusting filters.”

---

## 9. Frontend–Backend Integration (High-Level Contract)

Even though we avoid actual routes and code, the frontend expects the backend to provide:

* **Authentication & User Info**

  * `GET current_user` → `role`, `permissions`.
* **KB Management**

  * List KBs, get KB details, create/edit/delete KB.
* **Document Ingestion**

  * Upload endpoint.
  * Status endpoint for processing state.
  * Document list, details, reprocess, delete.
* **Q&A**

  * Ask endpoint:

    * Input: `question`, `kb_id`, optional `conversation_id`.
    * Output: `answer`, `sources`, `conversation_id`.
* **Search**

  * Search endpoint:

    * Input: `query`, filters (kb, tags).
    * Output: list of snippet results.
* **Analytics / Admin Data**

  * Usage metrics, user lists, system configuration.

The frontend will be implemented so that it can function as a **thin client** over this backend, without duplicating business logic.

---

## 10. Future Enhancements (UI Perspective)

* Multi-document compare view in `/documents/[id]`.
* Feedback on answers (thumbs up/down) stored and visualized in `/analytics`.
* Per-KB configuration page for:

  * Retrieval parameters (top-k, similarity threshold).
  * Answer style (short/long).
* Dark mode toggle.
* Guided onboarding tour for first-time users.

---

This document should be enough to:

* Explain **what pages you will build in Next.js**.
* Describe **what each page does, what it shows, and how it behaves**.
* Show **how the frontend talks to the backend conceptually**, without touching specific code or routes.

You can store this as `PROJECT_PLAN_FRONTEND.md` or `Frontend_Design_Document.docx` in your repo and treat it as the official UI spec while you start building.
