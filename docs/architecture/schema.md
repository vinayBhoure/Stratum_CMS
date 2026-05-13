# Database Schema — Stratum CMS

This document defines the Prisma schema design for all entities based on the class diagram and ERD.

---

## Schema Conventions
- **Prisma models**: PascalCase → mapped to snake_case tables via `@@map()`
- **Prisma fields**: camelCase → mapped to snake_case columns via `@map()`
- **Primary keys**: UUID (`@id @default(uuid())`)
- **Timestamps**: `createdAt` and `updatedAt` on every model
- **Cascading deletes**: Child records deleted when parent is removed

---

## Models

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String
  clerkId   String   @unique @map("clerk_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  projects       Project[]
  skills         Skill[]
  experiences    Experience[]
  contact        Contact?
  socialAccounts SocialAccount[]
  resume         Resume?

  @@map("users")
}

model Project {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  title       String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  mediaUrl    String?  @map("media_url")
  githubUrl   String?  @map("github_url")
  liveUrl     String?  @map("live_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectTags   ProjectTag[]
  projectSkills ProjectSkill[]

  @@index([userId])
  @@map("projects")
}

model Skill {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectSkills    ProjectSkill[]
  experienceSkills ExperienceSkill[]

  @@index([userId])
  @@map("skills")
}

model Experience {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  company     String
  role        String
  startDate   DateTime  @map("start_date")
  endDate     DateTime? @map("end_date")
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  experienceSkills ExperienceSkill[]

  @@index([userId])
  @@map("experiences")
}

model Contact {
  id            String  @id @default(uuid())
  userId        String  @unique @map("user_id")
  name          String?
  email         String?
  mobile        String?
  address       String?
  googleMapsUrl String? @map("google_maps_url")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("contacts")
}

model SocialAccount {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  platform  String
  url       String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("social_accounts")
}

model Resume {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  name      String?
  pdfUrl    String   @map("pdf_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("resumes")
}

model Tag {
  id        String       @id @default(uuid())
  name      String       @unique
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  projectTags ProjectTag[]

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

model ProjectSkill {
  projectId String  @map("project_id")
  skillId   String  @map("skill_id")
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  skill     Skill   @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@id([projectId, skillId])
  @@map("project_skills")
}

model ExperienceSkill {
  experienceId String     @map("experience_id")
  skillId      String     @map("skill_id")
  experience   Experience @relation(fields: [experienceId], references: [id], onDelete: Cascade)
  skill        Skill      @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@id([experienceId, skillId])
  @@map("experience_skills")
}
```

---

## Relationship Summary

| Relationship | Type | Join Table |
|-------------|------|------------|
| User → Project | One-to-Many | — |
| User → Skill | One-to-Many | — |
| User → Experience | One-to-Many | — |
| User → Contact | One-to-One | — |
| User → SocialAccount | One-to-Many | — |
| User → Resume | One-to-One | — |
| Project ↔ Tag | Many-to-Many | ProjectTag |
| Project ↔ Skill | Many-to-Many | ProjectSkill |
| Experience ↔ Skill | Many-to-Many | ExperienceSkill |

---

## Indexes
- `userId` on: Project, Skill, Experience, SocialAccount
- `createdAt` on: Project (for ordering)
- Unique: `User.username`, `User.email`, `User.clerkId`, `Tag.name`
- Unique (one-to-one): `Contact.userId`, `Resume.userId`
