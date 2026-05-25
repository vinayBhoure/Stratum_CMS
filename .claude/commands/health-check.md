Verify that all Stratum CMS services are running and connected.

Run these checks in sequence and report the result of each:

1. **Backend server:** `curl -s http://localhost:4000/health`
   - Expected: 200 response with health status
   - If fails: "Backend is not running. Start it with `/dev`."

2. **Frontend server:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`
   - Expected: 200
   - If fails: "Frontend is not running. Start it with `/dev`."

3. **Database connection:** `cd server && npx prisma db execute --stdin <<< "SELECT 1;"`
   - Expected: successful query
   - If fails: "Database connection failed. Check DATABASE_URL in server/.env"

4. **CORS check:** `curl -s -H "Origin: http://localhost:5173" -I http://localhost:4000/health | grep -i access-control`
   - Expected: `Access-Control-Allow-Origin` header present
   - If missing: "CORS is not configured. Check cors config in server/src/config/"

Print a summary at the end:
```
Health Check Summary:
  Backend:  ✓ / ✗
  Frontend: ✓ / ✗
  Database: ✓ / ✗
  CORS:     ✓ / ✗
```
