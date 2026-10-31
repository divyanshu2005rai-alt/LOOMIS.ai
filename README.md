# LOOMIS.ai — AI Creative Studio for YouTube Creators

> **Paint your video's story.** Upload once. Get titles, thumbnails, descriptions, and tweets that feel authentically like you.

LOOMIS.ai is an intelligent content creation workspace that helps YouTube creators transform their raw video content into high-CTR titles, engaging descriptions, stunning thumbnails, and viral social media threads. Built with React Router v7, Convex, Groq, Cloudflare Workers AI, and Clerk.

---

## ✨ Features

### 🎬 Video & Content Ingestion
- **Video Upload & Processing** — Upload videos (up to 1GB) with automatic metadata extraction (duration, resolution, format).
- **Fast Audio Transcription** — Transcribe spoken audio accurately and in seconds using **Groq Whisper** (`whisper-large-v3-turbo`).
- **Manual Transcription Support** — Connect custom `.txt`, `.srt`, or markdown transcripts directly on the canvas.
- **Mood Board References** — Connect YouTube video references, images, or music URLs into the workflow for tone and style inspiration.

### 🤖 Specialized AI Agents
- 📝 **Title Agent** — Generates high-CTR (10%+), curiosity-driven, SEO-optimized video titles under 60 characters.
- 📄 **Description Agent** — Writes 2-line, value-driven descriptions tailored to audience benefits without spammy fluff.
- 🖼️ **Thumbnail Agent** — Extracts video frame insights with **Cloudflare Llama 3.2 Vision** and generates 1024x1024 visual concepts with **Cloudflare SDXL**.
- 🐦 **Social Media Agent** — Crafts viral Twitter/X threads and promotion posts with hooks, timestamps, and key insights.

### 🎨 Interactive Node-Based Canvas
- **Visual Cross-Agent Workflows** — Drag, position, and connect nodes with directional arrows (e.g., connect **Tweets &rarr; Description** to align social hooks directly into your video description).
- **In-Canvas Chat & Mentions** — Chat with specialized agents using `@TITLE_AGENT`, `@DESCRIPTION_AGENT`, `@THUMBNAIL_AGENT`, or `@TWEETS_AGENT` to refine drafts in real time.
- **Interactive Watercolor Landing Page** — Organic visual centerpiece featuring drifting color blooms, spring-physics bubble interactions, sound synthesis, and paper-grain textures.
- **Content Preview Modal** — Instant side-by-side previews of how your title, thumbnail, and description look on YouTube and Twitter/X.
- **Shareable Canvas** — Generate read-only preview links to collaborate with teammates and clients.

---

## 🛠️ Tech Stack

### Frontend
- **React 19 & React Router v7** — Modern full-stack framework with Server-Side Rendering (SSR).
- **@xyflow/react (React Flow)** — Interactive node-based visual workflow canvas.
- **Tailwind CSS v4** — High-performance utility styling.
- **Framer Motion** — Physics-backed animations, jiggle interactions, and smooth transitions.
- **shadcn/ui & Radix UI** — Accessible, composable UI primitives.
- **Lucide React & Tabler Icons** — Comprehensive icon sets.
- **Sonner** — Fluid, animated toast notifications.

### Backend & AI Infrastructure
- **Convex** — Real-time reactive database, WebSocket synchronization, and serverless actions.
- **Groq** — Ultra-fast LLM text generation (`qwen/qwen3.8-27b`, `openai/gpt-oss-120b`) and audio transcription (`whisper-large-v3-turbo`).
- **Cloudflare Workers AI**:
  - `@cf/stabilityai/stable-diffusion-xl-base-1.0` (SDXL text-to-image).
  - `@cf/meta/llama-3.2-11b-vision-instruct` (Multimodal frame & image analysis).
- **Clerk** — User authentication, session management, and organization access.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- A free [Clerk](https://clerk.com) account
- A free [Convex](https://convex.dev) account
- A free [Groq Cloud](https://console.groq.com) API Key
- A free [Cloudflare Workers AI](https://dash.cloudflare.com) Account ID & API Token

---

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/your-username/youpac-ai.git
   cd youpac-ai
   npm install
   ```

2. **Set up local environment variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure your `.env.local`:**
   ```env
   # Convex Deployment
   CONVEX_DEPLOYMENT=dev:<your-deployment-name>
   VITE_CONVEX_URL=https://<your-deployment-name>.convex.cloud

   # AI Credentials (Groq & Cloudflare)
   GROQ_API_KEY=gsk_your_groq_api_key_here
   CF_ACCOUNT_ID=your_cloudflare_account_id_here
   CF_API_TOKEN=your_cloudflare_api_token_here

   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
   VITE_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev

   # Frontend
   FRONTEND_URL=http://localhost:5173
   ```

4. **Initialize Convex and push backend functions:**
   ```bash
   npx convex dev
   ```

5. **Set backend environment variables in Convex:**
   ```bash
   npx convex env set GROQ_API_KEY "your_groq_api_key"
   npx convex env set CF_ACCOUNT_ID "your_cloudflare_account_id"
   npx convex env set CF_API_TOKEN "your_cloudflare_api_token"
   npx convex env set VITE_CLERK_FRONTEND_API_URL "https://your-app.clerk.accounts.dev"
   ```

6. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Architecture

```
YOUPAC-AI/
├── app/
│   ├── components/
│   │   ├── canvas/         # React Flow canvas, node cards, modals, and chat
│   │   ├── dashboard/      # Projects view, settings, and sidebar navigation
│   │   ├── homepage/       # Watercolor hero, animated canvas, features, and navbar
│   │   ├── preview/        # Real-time YouTube & Twitter mockups
│   │   └── ui/             # Radix & shadcn/ui components
│   ├── routes/             # React Router v7 routes (home, dashboard, canvas, share)
│   ├── lib/                # Utility helpers, metadata extraction, formatting
│   └── root.tsx            # App root, Clerk provider, Convex provider, fonts
├── convex/
│   ├── aiProviders.ts      # Groq text generation & Cloudflare SDXL/Vision clients
│   ├── aiHackathon.ts      # Agent prompts, content synthesis & context assembly
│   ├── transcription.ts    # Groq Whisper audio transcription
│   ├── thumbnail.ts        # Cloudflare Vision frame analysis & SDXL image generation
│   ├── schema.ts           # Convex database schema (projects, videos, agents, chats)
│   └── projects.ts         # Project creation, listing, and archiving
└── public/                 # Static visual assets, fonts, icons
```

---

## 💡 How the Visual Canvas Works

1. **Upload or Link Content**:
   Add a Video node, paste a transcript, or create a Mood Board with creative references.
2. **Connect Agents with Arrows**:
   Connect your video node to the **Title**, **Description**, **Thumbnail**, and **Social Posts** agents.
3. **Cross-Agent Chaining**:
   Connect arrows between agents (e.g. `Tweets` &rarr; `Description` or `Title` &rarr; `Thumbnail`) to pipe generated copy from one agent directly into another for unified voice and framing.
4. **Iterate with In-Canvas Chat**:
   Click any agent node or open the floating chat to request specific refinements (e.g. *"Make the title more controversial"* or *"Focus the description on productivity benefits"*).
5. **Preview & Export**:
   Open the Preview modal to verify title lengths, thumbnail contrast, and tweet thread flow, then copy or export with one click.

---

## 🚢 Building & Deploying

### Build for Production
```bash
npm run build
```

### Deploy on Vercel
The repository includes configuration for the `@vercel/react-router` preset:
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set your environment variables (`VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, etc.).
4. Deploy!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
