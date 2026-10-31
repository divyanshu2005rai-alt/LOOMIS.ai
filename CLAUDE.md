# LOOMIS.ai — AI Agent Development & Architecture Guide (CLAUDE.md)

> **Important Reference for Future AI Agents:**  
> This file is the primary single source of truth for AI agents (Claude, Gemini, Cursor, Copilot, etc.) and human developers working on LOOMIS.ai. Read this document before making architectural changes or creating new nodes, AI pipelines, or database schemas.

---

## 1. Project Overview & Philosophy

**LOOMIS.ai** is an intelligent, visual node-based studio for YouTube content creators. Instead of treating packaging (titles, descriptions, thumbnails, social distribution) as disconnected tasks, LOOMIS.ai unifies post-production into an **interactive directed graph canvas**.

### Core Mental Model
```
User (Clerk Auth)
 └── Channel Profile (Brand voice, Niche, Target audience)
      └── Projects (1 Project = 1 Video Concept)
           └── Canvas (Infinite Workspace via @xyflow/react)
                ├── Video Node (Upload, Playback, Client FFmpeg WebAssembly audio/frames)
                ├── Transcription Node (Automated Groq Whisper or manual)
                ├── Title Agent Node (CTR Titles & hooks)
                ├── Description Agent Node (Summary, timestamps, SEO)
                ├── Thumbnail Agent Node (Visual synthesis via Cloudflare SDXL)
                ├── Tweets Agent Node (Social distribution thread)
                └── Moodboard Node (Inspirational references & styling)
```

### Graph Connection Semantics
Edges connect source data to consumer agents:
- `Video Node` $\rightarrow$ `Transcription Node`: Extracts audio/speech.
- `Transcription Node` $\rightarrow$ `Title Agent` / `Description Agent`: Feeds transcript context.
- `Title Agent` $\rightarrow$ `Thumbnail Agent`: Injects selected title into thumbnail composition.
- `Title Agent` + `Description Agent` $\rightarrow$ `Tweets Agent`: Generates social thread.

---

## 2. Tech Stack & Directory Structure

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Framework** | **React 19 + React Router v7** | Full-stack SSR/client framework (`app/routes/`, `app/root.tsx`) |
| **Build Tool** | **Vite 6** | Fast bundling, HMR, client/SSR compilation |
| **Backend & DB** | **Convex 1.24+** | Serverless reactive database, file storage (`_storage`), scheduled actions |
| **Auth** | **Clerk** | Client & server authentication (`@clerk/react-router`) |
| **Canvas** | **`@xyflow/react`** | Infinite node graph canvas, custom drag-and-drop nodes |
| **Client Media** | **FFmpeg WebAssembly** | Browser-based video frame grabbing & audio extraction |
| **Styling** | **Tailwind CSS v4 + Radix UI** | Modern utility styles, fluid watercolor theme (`WatercolorCanvas.tsx`) |
| **AI Models** | **Groq + Cloudflare Workers AI** | 100% free multi-model stack (No OpenAI subscription required) |

### Key Directory Structure
```
c:\Users\divya\OneDrive\Documents\ChatGPT\YOUPAC-AI\
├── app/                          # React Router v7 application code
│   ├── components/
│   │   ├── canvas/              # Nodes (VideoNode, AgentNode, ReactFlowWrapper, etc.)
│   │   ├── homepage/            # Landing page (hero-section, navbar, WatercolorCanvas)
│   │   ├── dashboard/           # Sidebar, header, user controls
│   │   └── preview/             # YouTube & Twitter feed preview modals
│   ├── routes/
│   │   ├── home.tsx             # Public landing page
│   │   ├── dashboard/           # Authenticated user projects & chat
│   │   └── project.$projectId.tsx # The infinite canvas workspace
│   └── root.tsx                 # HTML root layout, ClerkProvider, ConvexProviderWithClerk
├── convex/                       # Backend serverless functions & schema
│   ├── schema.ts                # Database tables & indexes
│   ├── aiProviders.ts           # Centralized AI routing (Groq + Cloudflare)
│   ├── ai.ts                    # Title, description, tweet generation actions
│   ├── thumbnail.ts             # Cloudflare SDXL image generation & refinement
│   ├── transcription.ts         # Groq Whisper audio transcription
│   ├── videos.ts                # Video uploads, metadata, transcription records
│   ├── projects.ts              # CRUD for creator projects
│   └── agents.ts                # Canvas agent node state & chat history
└── .env.local                   # Local credentials (GITIGNORED)
```

---

## 3. The AI Infrastructure (`convex/aiProviders.ts`)

All AI calls route through centralized helpers in [`convex/aiProviders.ts`](file:///c:/Users/divya/OneDrive/Documents/ChatGPT/YOUPAC-AI/convex/aiProviders.ts):

1. **Text & Reasoning Generation (`generateTextContent`)**:
   - Provider: **Groq** via `@ai-sdk/openai` (`baseURL: "https://api.groq.com/openai/v1"`).
   - Primary Model: `qwen/qwen3.8-27b`.
   - Fallback Model: `openai/gpt-oss-120b`.
2. **Audio Transcription (`transcribeAudioWithWhisper`)**:
   - Provider: **Groq Audio API** (`https://api.groq.com/openai/v1/audio/transcriptions`).
   - Model: `whisper-large-v3-turbo`.
   - Automatically chunks audio exceeding 25MB limits.
3. **Thumbnail Generation (`generateImageSDXL`)**:
   - Provider: **Cloudflare Workers AI REST API**.
   - Model: `@cf/stabilityai/stable-diffusion-xl-base-1.0`.
   - Output: PNG image buffer stored directly to Convex storage (`ctx.storage.store()`).
4. **Vision & Frame Analysis (`analyzeImageVision`)**:
   - Provider: **Cloudflare Workers AI REST API**.
   - Model: `@cf/meta/llama-3.2-11b-vision-instruct`.

---

## 4. Environment Variables Reference

All credentials live in `.env.local` (local) and in the **Convex Dashboard Environment Variables** (cloud):

| Variable | Location | Description |
| :--- | :--- | :--- |
| `CONVEX_DEPLOYMENT` | `.env.local` | e.g. `dev:chatty-octopus-118` |
| `VITE_CONVEX_URL` | `.env.local` | e.g. `https://chatty-octopus-118.convex.cloud` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `.env.local` | Clerk frontend publishable key |
| `CLERK_SECRET_KEY` | `.env.local` | Clerk backend secret key |
| `VITE_CLERK_FRONTEND_API_URL` | `.env.local` & Convex Cloud | Clerk auth domain (e.g. `https://...clerk.accounts.dev`) |
| `GROQ_API_KEY` | `.env.local` & Convex Cloud | Groq Cloud API key (`gsk_...`) |
| `CF_ACCOUNT_ID` | `.env.local` & Convex Cloud | Cloudflare Workers AI Account ID |
| `CF_API_TOKEN` | `.env.local` & Convex Cloud | Cloudflare API Token with Workers AI Read/Edit permissions |

> [!WARNING]
> When switching Convex deployments, `VITE_CLERK_FRONTEND_API_URL`, `GROQ_API_KEY`, `CF_ACCOUNT_ID`, and `CF_API_TOKEN` **MUST** be set in Convex Cloud Environment Variables before running `npx convex dev`, or functions will fail auth checks.

---

## 5. Development & Verification Commands

```powershell
# Start Convex backend sync (watches convex/ folder):
npx convex dev

# Start frontend development server:
npm run dev

# Full production build test:
npx react-router build

# Typecheck:
npm run typecheck

# Check deployment functions:
npx convex function-spec
```

---

## 6. Critical Guidelines & Rules for Future AI Agents

1. **Windows CRLF Handling:**
   Files on Windows may use `\r\n` line endings. If automated string replacements fail during editing, normalize file line endings using Python or regex before matching.
2. **Never Commit Secrets:**
   Never commit `.env.local`, `.env`, or API tokens. Always verify git status before pushing (`git check-ignore -v .env.local`).
3. **Convex Terminal Auth:**
   The Convex CLI relies on local stored tokens in `~/.convex/config.json`. If switching accounts, run `npx convex logout` followed by `npx convex dev` in an interactive terminal.
4. **Preserve `@convex-dev/polar`:**
   Polar is used in `convex/convex.config.ts` and `app/components/logos/Polar.tsx` for creator subscription tiers. Do not treat Polar packages as dead code.
5. **Dynamic URLs:**
   Never hardcode Convex deployment URLs (e.g., `https://charming-bird-938...`). Always use `process.env.VITE_CONVEX_URL` or `context.convexUrl`.
6. **Git Branch Synchronization:**
   Keep `NEW_UI` branch synchronized with `main` after commits (`git branch -f NEW_UI main`).
