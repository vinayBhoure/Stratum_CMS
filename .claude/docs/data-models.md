# Data Models — Stratum CMS

This document defines all database entities, their fields, and relationships as derived from the class diagram, ERD diagram, and technical architecture.

---

## Entities

### User
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| username | String | Unique |
| email | String | Unique |
| password | String | |
| clerkId | String | Unique, maps to Clerk user ID |

**Relationships:**
- Has many: Project, Skill, Experience, SocialAccount
- Has one: Contact, Resume

---

### Project
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id |
| title | String | Required, max 100 chars |
| description | String | Max 500 chars |
| mediaUrl | String | Cloudinary URL |
| githubUrl | String | Optional, URL validated |
| liveUrl | String | Optional, URL validated |

**Relationships:**
- Belongs to: User
- Many-to-many with Tag via ProjectTag
- Many-to-many with Skill via ProjectSkill

---

### Skill
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id |
| name | String | Required |

**Relationships:**
- Belongs to: User
- Many-to-many with Project via ProjectSkill
- Many-to-many with Experience via ExperienceSkill

---

### Experience
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id |
| company | String | Required |
| role | String | Required |
| startDate | Date | Required |
| endDate | Date | Nullable ("Present" if null) |
| description | String | Optional |

**Relationships:**
- Belongs to: User
- Many-to-many with Skill via ExperienceSkill

---

### Contact
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, Unique |
| name | String | |
| email | String | Validated |
| mobile | String | Optional |
| address | String | Optional |
| googleMapsUrl | String | Optional |

**Relationships:**
- Belongs to: User (one-to-one)

---

### SocialAccount
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id |
| platform | String | e.g., "LinkedIn", "GitHub", "Twitter" |
| url | String | URL validated |

**Relationships:**
- Belongs to: User

---

### Resume
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, Unique |
| name | String | |
| pdfUrl | String | Cloudinary URL |
| updatedAt | Timestamp | Auto-updated |

**Relationships:**
- Belongs to: User (one-to-one, replace on re-upload)

---

### Tag
| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | PK, auto-generated |
| name | String | Unique |

**Relationships:**
- Many-to-many with Project via ProjectTag

---

## Join Tables

### ProjectTag
| Field | Type | Constraints |
|-------|------|------------|
| projectId | UUID | FK → Project.id, Cascade delete |
| tagId | UUID | FK → Tag.id, Cascade delete |

**Composite PK:** (projectId, tagId)

### ProjectSkill
| Field | Type | Constraints |
|-------|------|------------|
| projectId | UUID | FK → Project.id |
| skillId | UUID | FK → Skill.id |

**Composite PK:** (projectId, skillId)

### ExperienceSkill
| Field | Type | Constraints |
|-------|------|------------|
| experienceId | UUID | FK → Experience.id |
| skillId | UUID | FK → Skill.id |

**Composite PK:** (experienceId, skillId)

---

## Schema Constraints
- Fixed structure — users cannot customize data models
- All fields predefined in Prisma schema
- Single resume per user (replace on re-upload)
- Prisma models use PascalCase; PostgreSQL tables use snake_case via `@@map()`
- Prisma fields use camelCase; PostgreSQL columns use snake_case via `@map()`
