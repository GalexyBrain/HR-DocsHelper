# Code Review

This document contains a review of the backend, frontend, and Docker configuration of the project. Each point includes a description of the issue or suggestion and is ranked by importance on a scale of 1 to 10.

---

## 1. Backend Review (`Api.py` & other Python modules)

### 1.1. Fragile LLM-based Query Generation
- **Importance: 6/10**
- **File(s):** `query.py`
- **Review:** The `get_and_process_query` function asks an LLM to generate a Python list of strings and then uses `ast.literal_eval` to parse it. This is extremely fragile and will break if the LLM adds an extra character, a comment, or slightly changes its output format. Relying on an LLM for rigid structural output without a stronger validation or parsing mechanism is not robust.
- **Suggestion:** Instead of asking for a Python list, instruct the LLM to return a JSON array. Use `json.loads()` to parse the output, which is a more standardized and robust method for data interchange. Add more resilient parsing logic and error handling around the LLM call.

### 1.2. Inefficient Document Cache Fallback
- **Importance: 5/10**
- **File(s):** `Api.py` (in `get_document` function)
- **Review:** When a document is not found in the `document_cache`, the API attempts to re-process the file from disk as a fallback. While well-intentioned, this is inefficient as it triggers the entire PDF/DOCX processing logic on-the-fly for a single request. This could lead to slow response times for uncached documents.
- **Suggestion:** The cache should ideally be a performance optimization, not a core part of the retrieval logic. When a document is first uploaded, it should be processed and its contents stored in a persistent location (like a database or file store) from which they can be retrieved directly, with the cache sitting in front. The current implementation mixes caching and data retrieval logic.

---

## 2. Frontend Review (Next.js & React)

### 2.1. Inefficient Data Fetching and State Management
- **Importance: 7/10**
- **File(s):** `app/kb/page.tsx`, `app/documents/page.tsx`, etc.
- **Review:** Multiple pages use `useState` and `useEffect` to fetch data on the client-side (`"use client"`). This pattern is functional but has drawbacks:
  - It can lead to "prop drilling" where data needs to be passed down through many component layers.
  - It doesn't handle caching, re-fetching, or de-duplicating requests automatically.
  - It increases the amount of JavaScript shipped to the client and can lead to loading spinners or layout shifts.
- **Suggestion:**
  - For data that doesn't change often, consider using Next.js Server Components to fetch data on the server. This would improve initial page load performance.
  - For client-side data that needs caching and synchronization (like KBs and documents), use a dedicated server-state management library like **TanStack Query (React Query)** or **SWR**. These libraries simplify data fetching, caching, and state management significantly.

### 2.2. Lack of Centralized API Logic
- **Importance: 6/10**
- **File(s):** `app/components/ask/ChatWindow.tsx`, `app/upload/page.tsx`, etc.
- **Review:** API calls are made directly from components using `fetch`. As the application grows, this will lead to duplicated logic for handling URLs, headers, request bodies, and error responses.
- **Suggestion:** Create a dedicated API client or service layer (e.g., `lib/api.ts`). This service would contain reusable functions for interacting with the backend (e.g., `fetchKbs()`, `uploadDocument()`, `postQuestion()`). This centralizes API logic, makes components cleaner, and simplifies future modifications.

### 2.3. Minimal User Feedback for Errors and Loading
- **Importance: 5/10**
- **File(s):** `app/components/ask/ChatWindow.tsx`, `app/upload/page.tsx`
- **Review:** Error handling is inconsistent. In the chat window, an API failure results in a console error and a generic "Sorry, I encountered an error" message. During upload, a failure might just stop without clear user feedback. There is no user-friendly feedback mechanism like a toast notification.
- **Suggestion:** Implement a global error notification system (e.g., using a toast library like `react-hot-toast`). Provide more specific error messages to the user where possible (e.g., "Upload failed: File type not supported").

---

## 3. Docker & Deployment Review

### 3.1. Basic Frontend Dockerfile
- **Importance: 7/10**
- **File(s):** `frontend/Dockerfile`
- **Review:** The frontend `Dockerfile` is a single-stage build. This means the final image contains all the build-time dependencies (`devDependencies`), which makes it unnecessarily large.
- **Suggestion:** Use a **multi-stage build**.
  - The first stage (the `build` stage) would install all dependencies (including dev dependencies), build the Next.js application (`npm run build`).
  - The second, final stage would be a lean Node.js image that copies *only* the build output (the `.next` directory, `public`, `package.json`) from the first stage and installs *only* production dependencies (`npm install --production`). This results in a much smaller and more secure production image.