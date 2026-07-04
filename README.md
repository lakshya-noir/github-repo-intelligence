# CodeAtlas — GitHub Repository Intelligence

> Point CodeAtlas at any public GitHub repository and get an instant AI-powered breakdown: architecture, tech stack, key files, quality report, and an interactive visual map — all in your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Summary** | Gemini 2.5 Flash reads the repo and returns a plain-English analysis covering purpose, architecture, and how to run it |
| **Tech Stack Detection** | Automatically detects languages and build systems from project files |
| **Atlas Visualizer** | Interactive file tree and dependency map of the repository |
| **File Inspector (IDE)** | Browse and read key source files directly in the UI |
| **Quality Auditor** | Code-smell and quality reports with hotspot identification |
| **Metrics Dashboard** | At-a-glance metrics and hotspot heatmap |

---

## 🏗️ Architecture

```
repo-intelligence/
├── backend/                  # FastAPI Python backend
│   ├── main.py               # App entry point & CORS config
│   ├── api/
│   │   └── routes.py         # POST /analyze endpoint
│   ├── github/
│   │   └── repo_cloner.py    # Shallow-clones repos via git
│   └── services/
│       ├── ai.py             # Gemini 2.5 Flash summarisation
│       ├── parser.py         # File tree traversal & tech detection
│       └── readme_reader.py  # Extracts README content
└── frontend/                 # React + TypeScript + Vite frontend
    └── src/
        ├── App.tsx
        ├── api.ts
        ├── types.ts
        └── components/
            ├── AnalysisLauncher.tsx
            ├── CodeAtlasMap.tsx
            ├── CodeExplorer.tsx
            ├── MetricsDashboard.tsx
            └── QualityAuditor.tsx
```

**Request flow:**

1. User pastes a GitHub URL into the frontend
2. Frontend calls `POST /analyze` on the FastAPI backend
3. Backend shallow-clones the repo (`git clone --depth 1`)
4. Parser walks the file tree and detects the tech stack
5. Gemini 2.5 Flash generates an AI summary
6. JSON response is rendered across the three dashboard tabs

---

## 🚀 Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- `git` available on `$PATH`
- A [Gemini API key](https://aistudio.google.com/app/apikey)

---

### Backend

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure your API key
cp backend/.env.example backend/.env
# Edit backend/.env and set your Gemini API key

# 4. Start the server (from the backend/ directory)
cd backend
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. (Optional) Override the backend URL — default is http://localhost:8000
cp .env.example .env.local
# Edit .env.local: VITE_API_URL="http://localhost:8000"

# 3. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ☁️ Deploying to Production

Backend → **Hugging Face Spaces** (free, always-on, no credit card)  
Frontend → **Vercel** (free, always-on, no credit card)  
All config files (`Dockerfile`, `vercel.json`) are already committed — no extra setup needed.

### Step 1 — Deploy the Backend on Hugging Face Spaces

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Set **Space name** (e.g. `codeatlas-backend`), pick **Docker** as the SDK
3. In the Space **Settings → Repository**, link your GitHub repo `lakshya-noir/github-repo-intelligence`  
   _(or manually push — HF Spaces is also a git remote)_
4. In Space **Settings → Secrets**, add:
   ```
   GEMINI_API_KEY = your_key_here
   ```
5. HF Spaces finds the `Dockerfile` at the repo root and builds automatically

Your backend will be live at:
```
https://your-username-codeatlas-backend.hf.space
```

> The `/health` endpoint confirms it's running:  
> `GET https://your-username-codeatlas-backend.hf.space/health` → `{ "status": "ok" }`

---

### Step 2 — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project → Import Git Repository**
2. Select `lakshya-noir/github-repo-intelligence`
3. Set **Root Directory** to `frontend`
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://your-username-codeatlas-backend.hf.space
   ```
5. Hit **Deploy** — Vercel picks up `vercel.json` automatically

> Vercel auto-detects Vite. No build settings need to be changed in the dashboard.

---

## 🔌 API Reference

### `POST /analyze`

Clones a repository, analyses it, and returns a structured summary.

**Request body**
```json
{
  "repo_url": "https://github.com/owner/repo"
}
```

**Response**
```json
{
  "status": "success",
  "repo_path": "repos/repo",
  "languages": ["JavaScript/TypeScript", "Python"],
  "build_files": ["package.json", "requirements.txt"],
  "important_files": ["README.md", "main.py", "package.json"],
  "summary": "..."
}
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

---

## 🛠️ Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — high-performance Python API framework
- [Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) — AI model for repository summarisation
- `python-dotenv` — environment variable management

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/) — lightning-fast build tooling
- [Tailwind CSS 4](https://tailwindcss.com/) — utility-first styling
- [Recharts](https://recharts.org/) — metrics visualisation
- [Lucide React](https://lucide.dev/) — icons
- [Motion](https://motion.dev/) — animations

---

## 📄 License

MIT
