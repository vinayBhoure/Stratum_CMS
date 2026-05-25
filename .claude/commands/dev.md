Start both Stratum CMS dev servers.

1. Check if ports 4000 (server) and 5173 (client) are already in use
   - If either is occupied, warn the developer and suggest killing the existing process
2. Start the backend: `cd server && npm run dev`
3. Start the frontend: `cd client && npm run dev`
4. Confirm both are running:
   - Server should be on `http://localhost:4000`
   - Client should be on `http://localhost:5173`
5. Run a quick health check: `curl http://localhost:4000/health`
   - If health check fails, show the error

Both servers should run concurrently. If the project has a root-level script for this (e.g., `npm run dev` with concurrently), use that instead.
