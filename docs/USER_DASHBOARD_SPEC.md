# User Dashboard — Spec (Side Nav: Summary & Package)

Status: Draft

## Overview
Goal: Replace the user dashboard with a two-pane layout: left side navigation and right content area. Initial scope: two sections — `Summary` (performance review) and `Package` (view packages and quizzes). The design follows existing Tailwind theme.

## High-level requirements
- Persistent side nav with two items: `Summary`, `Package`.
- Summary shows performance metrics and recent quiz attempts.
- Package shows user-visible packages and package details listing quizzes with Start/Resume actions.
- All API calls use credentials and return JSON shaped as described below.
- Unauthenticated users should be redirected to `/login`.

## Pages & Routes
- `/dashboard` — Dashboard entry; redirects to `/dashboard/summary` by default.
- `/dashboard/summary` — Summary view.
- `/dashboard/packages` — Package list view.
- `/dashboard/packages/[id]` — Package detail (quizzes for that package).

Implementation files (suggested):
- `studybuddy-web/src/(user)/dashboard/layout.tsx` — dashboard layout + side nav.
- `studybuddy-web/src/(user)/dashboard/page.tsx` — entry page redirecting to summary.
- `studybuddy-web/src/(user)/dashboard/summary/page.tsx` — summary page.
- `studybuddy-web/src/(user)/dashboard/packages/page.tsx` — packages list.
- `studybuddy-web/src/(user)/dashboard/packages/[id]/page.tsx` — package detail.
- Components:
  - `src/components/dashboard/SideNav.tsx`
  - `src/components/dashboard/SummaryPanel.tsx`
  - `src/components/dashboard/RecentAttempts.tsx`
  - `src/components/dashboard/PackageCard.tsx`
  - `src/components/dashboard/PackageDetail.tsx`

## Data / API contracts (proposals)
- GET `/api/users/me`
  - Response: `{ user: {...}, permissions: string[] }` (existing)

- GET `/api/dashboard/summary`
  - TO BE IMPLEMENTED

- GET `/api/packages` (user view)
  - Response: `[{ id, title, description, isActive, price, enrolled }]`

- GET `/api/packages/:id`
  - Response: `{ id, title, description, quizzes: [{ id, title, questionCount, bestScore, lastAttemptAt }] }`

- POST `/api/quizzes/:id/start`
  - Request body: `{}`
  - Response: `{ attemptId, startedAt, expiresAt }` — client redirects to quiz runner route.

Notes: endpoints may already exist; adapt existing `packages` and `quiz` controllers to return the proposed shapes.

## UI Behavior & Interactions
- Layout: desktop: fixed left 240px side nav + fluid content; mobile: side nav collapses to hamburger that opens slide-over.
- Summary panel cards:
  - Progress bar (progressPercent)
  - Avg score (avgScore)
  - Recent attempts list (click item to open attempt detail)
  - Quick actions: Resume last attempt, Start recommended quiz
- Package list: cards showing title, price, enrolled badge. Clicking opens detail pane with quizzes and action buttons.
- Start/Resume action:
  - Calls `POST /api/quizzes/:id/start` to create/return `attemptId`, then navigates to `/quiz/:attemptId` (existing quiz runner page).
- Loading states: skeleton placeholders for each async block.
- Error states: inline error messages with retry button.

## Permissions & Visibility
- Use `/api/users/me` permissions array to decide visibility.
- Hide package purchase CTA for non-logged-in users; hide package management actions for non-admins.
- Optional: hide packages with `enrolled=false` if product decision is to show only owned packages.

## Accessibility & Internationalization
- Use semantic elements; ensure keyboard navigation for side nav and focus states for actions.
- Strings should come from existing i18n system if available — otherwise keep easy-to-replace labels.

## Acceptance Criteria
- Side nav appears on `/dashboard/*` and persists selection via URL.
- `/dashboard/summary` loads and renders `progressPercent`, `avgScore`, and `recentAttempts` within 2s on dev machine.
- `/dashboard/packages` lists packages; clicking a package opens detail with quizzes.
- Clicking Start quiz creates an attempt and redirects to quiz runner with attempt ID.
- Proper loading and error states for all async data.
- Unit tests: each component has basic render tests; integration smoke test covers Summary load and Package start flow.

## Tasks & Estimates (rough)
1. Scaffolding & side nav (2–3h)
2. Summary panel (4–6h)
3. Packages list & detail (6–8h)
4. Start/Resume flow integration (2–4h)
5. Tests & QA (3–4h)
6. Responsive polish & accessibility fixes (2–3h)

## Next steps
- Confirm API availability / adapt server endpoints listed above.
- Approve layout and responsive behavior.
- I can implement the scaffolding and Summary panel next — confirm and I will create the files and a PR.

---
File created by the dev assistant. Update me which item you want implemented first (scaffolding or Summary panel).