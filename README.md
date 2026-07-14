# Stackroom — Team Q&A Knowledge Base (RAG)

A full-stack app for teams to build a searchable knowledge base out of their own documents,
and ask questions about them in plain English — answers are grounded in the actual uploaded
content, with sources shown for every answer.

**Live app:** https://stackroom-seven.vercel.app _(use this stable domain, not the random-letter
preview URLs Vercel generates on each deploy)_
**Backend API:** https://stackroom.onrender.com

## What it does

- Create a team account (one team per account created at signup)
- Create **repositories** — one per topic/knowledge area
- Upload documents: `.txt`, `.md`, `.csv`, `.xlsx`, `.xls`
- Ask questions in the **Ask** tab — get an answer plus the exact source passages it came from,
  with a relevance score for each
- **Bulk Q&A**: upload a spreadsheet with a "Question" column, get it back with an "Answer"
  column filled in automatically

## How it works (the RAG pipeline)

1. **Ingestion** — an uploaded document is split into overlapping text chunks (so no idea gets
   cut in half at a chunk boundary), and each chunk is sent to Google's Gemini embedding model,
   which converts it into a 3072-number vector representing its meaning. That vector is stored
   in PostgreSQL using the `pgvector` extension.
2. **Retrieval** — when a question is asked, it's embedded the same way, then PostgreSQL finds
   the stored chunks whose vectors are mathematically closest (cosine similarity).
3. **Generation** — those chunks plus the original question are sent to Gemini's chat model,
   instructed to answer only using that context. The response comes back with its sources
   attached.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), deployed on Vercel |
| Backend | Java 17, Spring Boot 3, deployed on Render (via Docker) |
| Database | PostgreSQL + pgvector, hosted on Supabase |
| AI | Google Gemini API (`gemini-embedding-001`, `gemini-2.5-flash`) — free tier |
| Auth | JWT, bcrypt password hashing |
| Migrations | Flyway |

## Project structure

```
ragqa/
  backend/
    Dockerfile        used by Render to build & run the backend
    src/main/resources/db/migration/   Flyway SQL migrations
  frontend/
    vercel.json        SPA routing fix (see "Known gotchas" below)
```

---

## Running it locally

You need: a Java 17+ JDK, Maven, Node.js, a Gemini API key (free, from
aistudio.google.com/apikey), and a PostgreSQL database with the `vector` extension enabled.

### Option A — PostgreSQL via Docker (simplest)

```
docker compose up -d
```
Starts a ready-to-go Postgres + pgvector container using `docker-compose.yml` in the project
root. Skip to "Start the backend" below.

### Option B — Native PostgreSQL (no Docker)

1. Install PostgreSQL from postgresql.org.
2. Install `pgvector` for your Postgres version — see github.com/pgvector/pgvector (on Windows
   this requires the Visual Studio C++ Build Tools to compile it — see their README for the
   `nmake` build steps).
3. Create the database and enable the extension:
   ```sql
   CREATE DATABASE ragqa;
   \c ragqa
   CREATE EXTENSION vector;
   ```
4. Confirm which port Postgres is actually listening on (it's not always the default 5432 if
   you have more than one Postgres install):
   ```
   netstat -an | findstr 5432
   ```

### Start the backend

```
cd backend
$env:DB_HOST="localhost"
$env:DB_PORT="5432"          # or 5433, or whatever your setup uses
$env:DB_NAME="ragqa"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your-postgres-password"
$env:GEMINI_API_KEY="your-gemini-key"
mvn spring-boot:run
```
(On Mac/Linux, use `export VAR=value` instead of `$env:VAR="value"`.)

### Start the frontend

```
cd frontend
npm install
npm run dev
```
Open the printed link (usually `http://localhost:5173`).

---

## Deploying it for free

1. **Database — Supabase** (supabase.com): create a project, enable the `vector` extension
   under Database → Extensions, and use the **Session pooler** connection details (not "Direct
   connection" — most free hosts only support outbound IPv4, and Supabase's direct connection
   is IPv6-only).
2. **Backend — Render** (render.com): new Web Service, connect your GitHub repo, root directory
   `backend`, it auto-detects the `Dockerfile`. Set environment variables:

   | Key | Value |
   |---|---|
   | `DB_HOST` | Supabase pooler host |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `postgres` |
   | `DB_USER` | Supabase pooler user (includes project ID, e.g. `postgres.xxxxxxx`) |
   | `DB_PASSWORD` | Supabase database password |
   | `GEMINI_API_KEY` | your Gemini key |
   | `JWT_SECRET` | any random string **32+ characters long** — shorter breaks startup |
   | `CORS_ALLOWED_ORIGINS` | your frontend's stable Vercel URL, set after step 3 |

3. **Frontend — Vercel** (vercel.com): new Project, connect the same repo, root directory
   `frontend`, environment variable `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`.
4. Go back to Render and set `CORS_ALLOWED_ORIGINS` to your real Vercel URL.
5. **Set up a stable domain in Vercel** (Settings → Domains) — the default per-deployment URLs
   have random letters and change on some deploys. Use the plain `yourproject.vercel.app` one as
   Production and point CORS at that instead, so it doesn't need updating every time you deploy.
6. **Keep the backend from sleeping** (optional but recommended): Render's free tier sleeps
   after 15 minutes idle, causing a 30-60s delay on the next request. Set up a free ping at
   cron-job.org hitting `https://your-backend.onrender.com/actuator/health` every 10 minutes to
   keep it always warm.

## Known gotchas (things that actually broke during development)

- **SPA routes 404 on refresh** — React Router handles routing entirely client-side, but static
  hosts look for a real file at each URL. Fixed with `frontend/vercel.json`:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **`node_modules` committed to git breaks the Vercel build** ("Permission denied" / exit code
  126) — make sure `frontend/.gitignore` includes `node_modules/`, and if it's already
  committed: `git rm -r --cached frontend/node_modules`.
- **Backend crashes on startup with a `JwtService` bean creation error** — `JWT_SECRET` is
  missing or under 32 characters.
- **`Connection refused` to the database on Render** — Supabase's "Direct connection" is
  IPv6-only and Render doesn't support outbound IPv6. Use the **Session pooler** connection
  details instead.
- **CORS errors ("blocked by CORS policy")** — `CORS_ALLOWED_ORIGINS` on the backend doesn't
  exactly match the frontend's real URL (check for typos, trailing slashes, and whether Vercel
  gave you a *new* random URL after a redeploy).
- **`current transaction is aborted` errors during document upload** — a lower-level failure
  (e.g. an embedding API error) happened inside a single database transaction, and error-handling
  code tried to run more queries in that same broken transaction. Fixed by not wrapping
  ingestion in one big `@Transactional` block, so failure cleanup can run independently.

## Known constraints

- Gemini's free tier has daily rate limits — fine for a small team, not heavy production use.
- Vector search uses a direct (sequential) comparison, not an approximate index — pgvector's
  indexes cap out at 2000 dimensions, and Gemini's embeddings are 3072-dimensional. Fine at the
  scale of a team's document set; would need revisiting for a much larger corpus.
- Supported upload types: `.txt`, `.md`, `.csv`, `.xlsx`, `.xls` (max 20MB per file).
- Bulk Q&A processes up to 200 questions per spreadsheet in one go.
