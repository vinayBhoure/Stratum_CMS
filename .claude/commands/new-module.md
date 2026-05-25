Scaffold all files for a new Stratum CMS content module.

If `$ARGUMENTS` is provided, use it as the module name (e.g., `/new-module blogs`).
If not provided, ask the developer for the module name (singular, lowercase).

**This command creates empty stub files — it does NOT write business logic.**
Business logic is guided by the `crud-module` skill when it's time to implement.

**Files to create:**

Backend (in `/server/src/`):
1. `controllers/{module}.controller.ts` — export stub functions matching CRUD pattern (list, getById, create, update, delete)
2. `services/{module}.service.ts` — export stub functions matching controller
3. `routes/{module}.routes.ts` — import controller, wire routes with placeholder middleware
4. `validators/{module}.schema.ts` — export empty Zod schemas (create, update)

Frontend (in `/client/src/`):
1. `redux/api/{module}.api.ts` — RTK Query API slice stub with baseApi injection
2. `validators/{module}.schema.ts` — mirror of backend schema (empty for now)

**After creating files:**

1. Register the new route file in `/server/src/routes/index.ts`
2. Show the developer the list of created files
3. Remind them:
   - Controller stubs need `asyncHandler` wrapping
   - Service stubs need proper Prisma queries (use the `crud-module` skill)
   - Validators need Zod schemas (use the `zod-validation` skill)
   - FE validators must mirror BE once schemas are written

**Naming convention:**
- Filenames use the domain name as-is: `projects`, `experience`, `skills` (not `project`, `skill`)
- Match existing patterns in the codebase
