# Stackroom — Team Q&A Knowledge Base (RAG)

A full-stack app for teams to build a searchable knowledge base out of their own documents,
and ask questions about them in plain English — answers are grounded in the actual uploaded
content, with sources shown for every answer. Also embeddable as a customer-facing chat widget
on any external website.

**Live app:** https://stackroom-seven.vercel.app _(update this if your Vercel URL changes)_
**Backend API:** https://stackroom.onrender.com

## What it does

- Create a team account (one team per account created at signup)
- Create **repositories** — one per topic/knowledge area
- Upload documents: `.txt`, `.md`, `.csv`, `.xlsx`, `.xls`
- Ask questions in the **Ask** tab — get an answer plus the exact source passages it came from,
  with a relevance score for each
- **Bulk Q&A**: upload a spreadsheet with a "Question" column, get it back with an "Answer"
  column filled in automatically
- **Dashboard assistant**: a chat widget on the dashboard that picks the right repository for
  whatever you ask and answers directly, no need to open the repository yourself first
- **Embeddable public widget**: any external website (e.g. an e-commerce store) can embed a
  chat widget that answers customer questions using one repository's documents, with no login
  required — see "Embeddable widget" below

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
  sample-data/
    washing-machines.csv, televisions.csv, air-conditioners.csv
      sample product catalogs for the embeddable widget demo
    appliancehub-demo.html
      standalone demo e-commerce site with the widget embedded
```

---

## Embeddable widget (customer-facing chatbot on another website)

Stackroom can power a support chatbot on any external site — e.g. an e-commerce store —
without requiring visitors to log in. This works via a public, unauthenticated endpoint scoped
to a single repository:

```
POST /api/public/repositories/{repositoryId}/ask
Body: { "question": "..." }
```

**To try the demo:**
1. Create a repository (e.g. "Home Appliances").
2. Upload `sample-data/washing-machines.csv`, `televisions.csv`, and `air-conditioners.csv`
   into that **same** repository (the widget answers across everything in one repository).
3. Copy that repository's ID from the browser URL bar.
4. Open `sample-data/appliancehub-demo.html` in a text editor, set:
   ```javascript
   const STACKROOM_BACKEND_URL = "https://stackroom.onrender.com";
   const STACKROOM_REPOSITORY_ID = "your-repository-id-only-not-the-full-url";
   ```
5. Open the HTML file in a browser and try the chat widget.

**Security note:** this endpoint is intentionally public — the repository ID itself acts as the
access key, with no further auth. Only point it at repositories you're fine making public.

**CORS note:** since the widget calls the backend directly from wherever it's hosted, that
origin needs to be in `CORS_ALLOWED_ORIGINS` on Render — including `null` if you're opening the
HTML file directly (double-clicking it) rather than serving it through a real web server.

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
4. Confirm which port Postgres is actually listening on (not always the default 5432 if you
   have more than one Postgres install):
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
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,null"   # the "null" origin covers HTML files opened directly
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
   | `CORS_ALLOWED_ORIGINS` | comma-separated list of every origin that calls this backend: your Vercel frontend, plus `null` if you host the widget demo as a local file |

3. **Frontend — Vercel** (vercel.com): new Project, connect the same repo, root directory
   `frontend`, environment variable `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`.
4. Go back to Render and update `CORS_ALLOWED_ORIGINS` to include your real Vercel URL.
5. **Set up a stable domain in Vercel** (Settings → Domains) — the default per-deployment URLs
   have random letters and can change between deploys. Use the plain `yourproject.vercel.app`
   one as Production and point CORS at that, so it doesn't need updating every time you deploy.
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
  exactly match the calling site's real origin (check for typos, trailing slashes, whether
  Vercel gave you a *new* random URL after a redeploy, or whether you need `null` for a locally
  opened HTML file).
- **`current transaction is aborted` errors during document upload** — a lower-level failure
  (e.g. an embedding API error) happened inside a single database transaction, and error-handling
  code tried to run more queries in that same broken transaction. Fixed by not wrapping
  ingestion in one big `@Transactional` block, so failure cleanup can run independently.
- **"Unexpected end of JSON input" when deleting something** — the frontend assumed every
  response had a JSON body; delete endpoints return an empty body on success. Fixed in
  `api/client.js` by checking for empty responses before parsing.
- **Local Flyway migration checksum mismatch** — happens if the migration SQL file is edited
  after it's already been applied to a local database. Since local dev data isn't precious,
  easiest fix is dropping and recreating the local database.
- **Migration file edited mid-project changed the vector column size 3 times** (1536 → 768 →
  3072) while switching AI providers (OpenAI → Ollama → Gemini) — each provider's embedding
  model outputs a different-sized vector, and the database column has to match exactly.

## Known constraints

- Gemini's free tier has daily rate limits — fine for a small team, not heavy production use.
- Vector search uses a direct (sequential) comparison, not an approximate index — pgvector's
  indexes cap out at 2000 dimensions, and Gemini's embeddings are 3072-dimensional. Fine at the
  scale of a team's document set; would need revisiting for a much larger corpus.
- Supported upload types: `.txt`, `.md`, `.csv`, `.xlsx`, `.xls` (max 20MB per file).
- Bulk Q&A processes up to 200 questions per spreadsheet in one go.
- The public widget endpoint has no rate limiting or per-site restriction — fine for a demo,
  would need hardening (API keys per site, rate limits) before real production use.
