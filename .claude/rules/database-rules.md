# Database Rules (Prisma + PostgreSQL)

## Schema Design Principles

### 1. Naming Conventions

#### Prisma Model vs PostgreSQL Table Naming
- **Prisma models**: PascalCase — `User`, `Project`, `ProjectTag`
- **PostgreSQL tables**: snake_case, plural — `users`, `projects`, `project_tags`
- **Rule**: Always use `@@map("table_name")` on every model to explicitly map PascalCase models to snake_case table names
- **Join tables**: `project_tags`, `user_roles` (always use `@@map()`)

#### Column Names
- **Prisma fields**: camelCase — `userId`, `createdAt`, `techStack`
- **PostgreSQL columns**: snake_case — `user_id`, `created_at`, `tech_stack`
- **Rule**: Always use `@map("column_name")` on fields where Prisma camelCase differs from DB snake_case
- **Booleans prefix**: `isPublished` → `@map("is_published")`

#### Primary Keys
- Always use `id` field
- Type: `String @id @default(uuid())` for distributed systems
- Or: `Int @id @default(autoincrement())` for simpler cases

### 2. Timestamps
Every table MUST have:
```prisma
model Project {
  id        String   @id @default(uuid())
  // ... other fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("projects")
}
```

### 3. Relationships

#### One-to-Many
```prisma
model User {
  id       String    @id @default(uuid())
  projects Project[]

  @@map("users")
}

model Project {
  id     String @id @default(uuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("projects")
}
```

#### Many-to-Many
```prisma
model Project {
  id   String       @id @default(uuid())
  tags ProjectTag[]

  @@map("projects")
}

model Tag {
  id       String       @id @default(uuid())
  projects ProjectTag[]

  @@map("tags")
}

model ProjectTag {
  projectId String  @map("project_id")
  tagId     String  @map("tag_id")
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
  @@map("project_tags")
}
```

### 4. Indexes
Add indexes for:
- Foreign keys (automatic in Prisma)
- Frequently queried fields
- Fields used in WHERE clauses

```prisma
model Project {
  id        String   @id @default(uuid())
  slug      String   @unique
  userId    String   @map("user_id")
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
  @@map("projects")
}
```

### 5. Cascading Deletes
Define what happens when parent is deleted:
```prisma
model Project {
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("projects")
}
```

Options:
- `Cascade`: Delete child records
- `SetNull`: Set foreign key to null
- `Restrict`: Prevent deletion if children exist

## Migration Rules

### Creating Migrations
```bash
# 1. Modify schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add_projects_table

# 3. Review generated SQL before committing
```

### Migration Naming
Format: `action_entity_detail`
- ✅ `add_projects_table`
- ✅ `add_slug_to_blogs`
- ✅ `rename_user_email_field`
- ❌ `update_schema`
- ❌ `changes`

### Never Modify Existing Migrations
Once a migration is committed and deployed, it's immutable. Create a new migration instead.

## Query Best Practices

### 1. Select Only Needed Fields
❌ **Bad:**
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

✅ **Good:**
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true }
});
```

### 2. Use Includes Sparingly
❌ **Bad:**
```javascript
const projects = await prisma.project.findMany({
  include: { 
    user: true, 
    tags: true, 
    comments: true 
  }
});
```

✅ **Good:**
```javascript
const projects = await prisma.project.findMany({
  include: { 
    tags: { select: { name: true, id: true } }
  }
});
```

### 3. Pagination for Large Datasets
```javascript
const projects = await prisma.project.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

### 4. Use Transactions for Multi-Step Operations
```javascript
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data: projectData });
  await tx.projectTag.createMany({ 
    data: tags.map(tagId => ({ projectId: project.id, tagId }))
  });
});
```

## Data Validation

### Schema-Level Constraints
```prisma
model User {
  id    String @id @default(uuid())
  email String @unique @db.VarChar(255)
  name  String @db.VarChar(100)
  age   Int?   @db.SmallInt // Optional field
}
```

### Application-Level Validation
Always validate before database operations:
```javascript
const { z } = require('zod');

const ProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  techStack: z.array(z.string()).min(1)
});

/**
 * @param {unknown} data
 * @returns {Promise<Object>}
 */
async function createProject(data) {
  const validated = ProjectSchema.parse(data);
  return prisma.project.create({ data: validated });
}
```

## Seeding

### Seed File Location
`/server/prisma/seed.js`

### Seed Script
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create tags
  const tags = await prisma.tag.createMany({
    data: [
      { name: 'React' },
      { name: 'JavaScript' },
      { name: 'Node.js' }
    ]
  });

  // Create sample project
  await prisma.project.create({
    data: {
      title: 'Sample Project',
      description: 'This is a sample project',
      techStack: ['React', 'JavaScript'],
      userId: 'seed-user-id'
    }
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Run seed:
```bash
npx prisma db seed
```

## Security

### Never Expose Raw Errors
❌ **Bad:**
```javascript
catch (error) {
  res.status(500).json({ error: error.message });
}
```

✅ **Good:**
```javascript
catch (error) {
  console.error('DB Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### Use Prepared Statements (Automatic with Prisma)
Prisma parameterizes all queries automatically, preventing SQL injection.

### Row-Level Security (Phase 4)
For multi-tenancy, use **Prisma Client Extensions** (modern approach):
```javascript
// Extend Prisma client to auto-filter by authenticated user
const xprisma = prisma.$extends({
  query: {
    project: {
      async findMany({ args, query }) {
        args.where = { ...args.where, userId: currentUserId };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, userId: currentUserId };
        return query(args);
      },
      async update({ args, query }) {
        args.where = { ...args.where, userId: currentUserId };
        return query(args);
      },
      async delete({ args, query }) {
        args.where = { ...args.where, userId: currentUserId };
        return query(args);
      }
    }
  }
});

// Use xprisma instead of prisma for user-scoped queries
const projects = await xprisma.project.findMany();
// ↑ Automatically filtered to currentUserId
```

> **Note:** `prisma.$use()` middleware is deprecated in Prisma 5+. Always use Client Extensions.