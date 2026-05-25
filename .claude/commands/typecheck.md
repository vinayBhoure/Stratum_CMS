Run TypeScript type checking across the entire Stratum CMS codebase without building.

1. Run in `/server`: `npx tsc --noEmit`
2. Run in `/client`: `npx tsc --noEmit`
3. Report all type errors — group by server vs client
4. If errors reference Prisma generated types, suggest running `/migrate` to regenerate the Prisma client
5. If errors are `any` type usage, flag them — Stratum CMS enforces strict mode with no `any` types
