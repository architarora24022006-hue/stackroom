# Stackroom — Team Q&A Knowledge Base (RAG)

Three moving pieces, all running on your own computer, all free:

1. **Database** — PostgreSQL + pgvector, started with Docker
2. **Backend** — Spring Boot server (Java), talks to the database and to Ollama
3. **AI models** — Ollama, running locally, no API key

The frontend (React) talks to the backend, the backend talks to the database and to Ollama.

## One-time setup

1. Install **Docker Desktop** — docker.com
2. Install **Ollama** — ollama.com, then in a terminal:
   ```
   ollama pull nomic-embed-text
   ollama pull llama3.2
   ```
3. Install a **Java 17+ JDK** — adoptium.net (pick "Temurin 17", your OS)
4. Install **Maven** — maven.apache.org/download.cgi (grab the "Binary zip archive", unzip it, add its `bin` folder to your PATH — see maven.apache.org/install.html if that's unfamiliar)
5. Install **Node.js** — nodejs.org (needed for the frontend)

## Every time you want to run it

**1. Start the database.** In the `ragqa` folder:
```
docker compose up -d
```

**2. Start the backend.** In the `backend` folder:
```
mvn spring-boot:run
```
Leave this running — it's your server, listening on port 8080.

**3. Start the frontend.** In the `frontend` folder:
```
npm install
npm run dev
```
Open the link it prints (usually http://localhost:5173).

**4. Make sure Ollama is running** in the background (it usually auto-starts).

## Using it

1. Go to the app in your browser, click "Create an account" — this creates your team.
2. Create a repository (e.g. "Billing FAQ").
3. Upload a `.txt`, `.md`, or `.csv` file — it gets split into chunks and embedded.
4. Ask a question in the "Ask" tab — you'll get an answer plus the source passages it came from.

## If something breaks

- **Backend won't start / database errors** — make sure `docker compose up -d` finished and Docker Desktop is running.
- **"Could not parse embedding response from Ollama"** — Ollama isn't running, or you haven't pulled `nomic-embed-text` / `llama3.2` yet.
- **Frontend shows network errors** — check the backend terminal is still running with no red errors.
