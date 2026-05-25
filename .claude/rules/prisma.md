---
globs: "server/prisma/**"
---

# Prisma Rules — Stratum CMS

## Schema Constraints
- `userId` is an opaque nanoid(12) generated in the application layer. It is `@db.VarChar(12)` everywhere. Never use UUID, CUID, or auto-increment for userId.
- Every content table must have a `userId` foreign key with `onDelete: Cascade`. User deletion wipes all their content.
- Every table must have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- No `tenantId` column anywhere. The `userId` field is sufficient for data isolation (Path A locked, decision D11).
- No `redirectLink` field on the Project model (removed, decision D5).
- No `pinned` system tag (removed, decision D6).

## Junction Table Rules
- Junction tables (ProjectSkill, ProjectTag, ExperienceSkill) use composite primary keys on both foreign keys.
- Parent side (projectId, experienceId) uses `onDelete: Cascade` — deleting a project removes its skill/tag links.
- Reference side (skillId, tagId) uses `onDelete: Restrict` — a skill or tag cannot be deleted while linked. This is the DB-level backstop for block-delete.
- Never change Cascade to Restrict on the parent side. Never change Restrict to Cascade on the reference side.

## Naming
- Model names are PascalCase: `ProjectSkill`, `TokenBlacklist`, `UserInformation`.
- Table mappings use `@@map("snake_case")`: `@@map("project_skills")`, `@@map("token_blacklist")`.
- Field names are camelCase: `userId`, `createdAt`, `activeJob`, `isSystem`.

## Migrations
- Always use `prisma migrate dev` for trackable migrations. Never use `prisma db push` except for initial prototyping.
- Migration names should be descriptive: `--name add-experience-skills-junction`, not `--name update`.
- Run `prisma generate` after every migration to keep the Prisma client in sync.
- Never edit a migration file after it has been applied. Create a new migration instead.

## Seed
- The seed script (`seed.ts`) must be idempotent — safe to run multiple times without duplicating data.
- The `featured` system tag is seeded with `userId: null` and `isSystem: true`. Do not change this.

## Raw SQL
- Never use `$queryRaw` or `$executeRaw` unless there is no Prisma equivalent. If used, it must be parameterized — never concatenate user input into the query string.
