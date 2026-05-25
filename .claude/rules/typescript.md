---
globs: "**/*.{ts,tsx}"
---

# TypeScript Rules — Stratum CMS

- TypeScript strict mode is enabled. Never disable it, never add `// @ts-ignore` or `// @ts-nocheck`.
- No `any` type. No implicit `any`. No type assertions (`as any`, `as unknown as X`) without a comment explaining why the assertion is unavoidable.
- Use named exports only. No default exports except where required by a framework (e.g., Vite config).
- camelCase for variables, functions, parameters, and object properties. PascalCase for types, interfaces, classes, enums, and React components.
- File names use the domain as-is with dot notation: `projects.controller.ts`, `auth.schema.ts`, `ProjectCard.tsx`. No index files as barrel re-exports.
- Prisma-generated types are the source of truth for data shapes. Do not create manual TypeScript interfaces that duplicate Prisma model types. Extend or pick from Prisma types when a subset is needed.
- Use `const` by default. Use `let` only when reassignment is necessary. Never use `var`.
- Prefer explicit return types on exported functions. Inferred types are acceptable for internal/private helpers.
- No `console.log` in committed code. Use the project's logging approach or remove before commit.
- Unused imports, variables, and parameters must be removed before commit — do not leave them commented out.
