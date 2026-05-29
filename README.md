# Pinboard

Shared task & file board for two cofounders.

## First-time setup

### 1. Supabase
1. Create a new project at https://supabase.com
2. In the dashboard go to **Storage → New bucket**, name it `pinboard-files`, leave **Public** OFF.
3. In the SQL editor, run the contents of `supabase/schema.sql`.
4. Copy your project URL and **service role** key from Settings → API.

### 2. Backend
```bash
cd backend
cp .env.example .env          # fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Frontend
```bash
cd frontend
npm install
```

## Running in dev

Terminal A (backend):
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Terminal B (frontend):
```bash
cd frontend
npm run dev          # Vite proxies /api → localhost:8000
```
Open http://localhost:5173

## Production build

```bash
cd frontend && npm run build    # outputs to frontend/dist
cd ../backend
uvicorn app.main:app --port 8000
# FastAPI serves the built SPA + API on :8000
```

## Card rules

| Priority  | Due in   |
|-----------|----------|
| High      | 1 day    |
| Medium    | 2 days   |
| Low       | 3 days   |
| Very Low  | 5 days   |

- To Do cards: **yellow** outline normally, **red** outline when overdue.
- Editing a card's priority recomputes its due date from the original creation time.
- Each uploaded file becomes its own card. Text + files in one submit all share the chosen priority.
