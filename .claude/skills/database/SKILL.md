---
name: database-management
description: Manage the PostgreSQL database via Prisma ORM for Stratum CMS. Use this skill when working on schema design, migrations, seed data, queries, or database optimization. Covers Prisma schema conventions, migration workflows, query best practices, and data validation with Zod.
---

This skill guides all database-related work for Stratum CMS using Prisma ORM and PostgreSQL.

## Tech Stack
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod (application-level)
- **Schema Location**: `server/prisma/schema.prisma`
- **Seed File**: `server/prisma/seed.js`

## Naming Conventions
- **Prisma models**: PascalCase — `User`, `Project`, `ProjectTag`
- **PostgreSQL tables**: snake_case, plural — `users`, `projects`, `project_tags`
- **Prisma fields**: camelCase — `userId`, `createdAt`, `techStack`
- **PostgreSQL columns**: snake_case — `user_id`, `created_at`, `tech_stack`
- Always use `@@map("table_name")` on every model
- Always use `@map("column_name")` on fields where naming differs

## Core Entities
- `User` — id, clerkUserId, username, email, createdAt
- `Project` — id, userId, title, description, techStack[], githubUrl, liveUrl, tags[], imageUrl
- `Experience` — id, userId, company, role, startDate, endDate, description, location
- `Skill` — id, userId, name, proficiency, category
- `Contact` — id, userId, email, linkedin, github, twitter, portfolioUrl
- `Resume` — id, userId, pdfUrl, uploadedAt
- `Tag` — id, name
- `SocialAccount` — id, userId, platform, url

## Relationships
- User has many: Projects, Experience, Skills, SocialAccounts
- User has one: Contact, Resume
- Project ↔ Tag: Many-to-many via ProjectTag join table
- Project ↔ Skill: Many-to-many via ProjectSkill join table
- Experience ↔ Skill: Many-to-many via ExperienceSkill join table

## Key Patterns

### Every Model Must Have Timestamps
```prisma
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

### Cascading Deletes
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

### Pagination
```javascript
const projects = await prisma.project.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

### Transactions
```javascript
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data: projectData });
  await tx.projectTag.createMany({
    data: tags.map(tagId => ({ projectId: project.id, tagId }))
  });
});
```

## Migration Workflow
1. Modify `schema.prisma`
2. Run `npx prisma migrate dev --name <action_entity_detail>`
3. Review generated SQL before committing
4. Never modify existing migrations after commit

## Constraints
- Fixed schema — users cannot customize data models
- Schema constraints: `@@map()` and `@map()` are mandatory
- Select only needed fields in queries (avoid `findMany()` without `select`)
- Use Zod for application-level validation before database operations
