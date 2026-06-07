# Hackathon Helper AI

An AI-powered hackathon companion that turns project ideas into winning plans — generating project roadmaps, tech stacks, code snippets, pitch decks, timelines, and more using Google Gemini.

## Run & Operate

- `pnpm --filter @workspace/hackathon-helper run dev` — run the frontend (Vite, port from $PORT)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind v4 + Wouter (routing) + Framer Motion
- Auth & DB: Firebase Auth + Firestore + Firebase Storage
- AI: Google Gemini (`@google/generative-ai`) — called client-side via `VITE_GEMINI_API_KEY`
- PDF export: jsPDF | PPT export: pptxgenjs | Charts: Recharts

## Where things live

- `artifacts/hackathon-helper/src/` — all frontend source
  - `lib/firebase.ts` — Firebase initialization (reads `VITE_FIREBASE_*` env vars)
  - `lib/gemini.ts` — Gemini AI calls for project generation + mentor chat
  - `lib/types.ts` — shared types: `Project`, `OutputKey`, `GeneratedResults`, etc.
  - `context/AuthContext.tsx` — Firebase auth state + Google sign-in
  - `context/ThemeContext.tsx` — light/dark theme, synced to Firestore
  - `pages/` — one file per route: Landing, Login, Signup, Dashboard, CreateProject, Project, History, Profile, Settings
  - `components/` — Sidebar, DashboardLayout, ProtectedRoute, MentorChat, ThemeToggle
  - `components/ui/ContentRenderer.tsx` — renders all 13 output types (radar charts, timelines, code blocks, etc.)

## Architecture decisions

- Gemini is called **client-side** with `VITE_GEMINI_API_KEY` — simpler for a hackathon tool, avoids a backend proxy
- All user data (projects, chat history, user profiles) lives in **Firestore** — no separate DB needed
- Routing uses **Wouter** (tiny, no React Router overhead) with `base={import.meta.env.BASE_URL}`
- Theme is persisted both in `localStorage` and Firestore user document so it survives sessions
- PDF/PPT export is done **client-side** with lazy-loaded jsPDF/pptxgenjs to keep initial bundle small

## Product

- Landing page with feature showcase and CTAs
- Email/password + Google OAuth sign-up & login
- "Create Project" wizard: enter title + description, pick team size & duration, select from 13 AI outputs
- Project detail page with tabbed output viewer (plan, tech stack, schema, UI design, code, PPT, README, scores, pitches, tasks, timeline, validator)
- PDF export (all outputs) and PPTX export (10-slide deck)
- Per-project AI mentor chat (Firestore-backed conversation history)
- Project history with search + delete
- Profile page with achievement badges
- Settings: update display name, change password, toggle theme

## Required Secrets

All set via Replit Secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GEMINI_API_KEY`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firebase `VITE_*` env vars must be set before the Vite dev server starts — restart the workflow after adding secrets
- Firestore security rules need to be configured in the Firebase console to allow reads/writes for authenticated users
- Google sign-in requires the Replit preview domain to be added to Firebase Auth → Authorized domains

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
