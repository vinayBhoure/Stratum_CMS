# Reference — Stratum CMS

Quick-reference document for API contracts, data formats, and development commands.

---

## API Contracts

### Base URL
```
https://api.stratumcms.com/api/v1/
```

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:username/projects` | Returns all user projects |
| GET | `/:username/experience` | Returns work history |
| GET | `/:username/skills` | Returns skills list |
| GET | `/:username/contact` | Returns contact info |
| GET | `/:username/resume` | Returns resume PDF URL |

### Authenticated Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects` | Create new project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| POST | `/upload` | Upload file to Cloudinary |

Repeat POST/PUT/DELETE pattern for: `experience`, `skills`, `contact`, `resume`

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

---

## Development Commands

### Frontend
```bash
cd client && npm run dev      # Start dev server
cd client && npm run build    # Production build
cd client && npm run lint     # Run ESLint
```

### Backend
```bash
cd server && npm run dev      # Start dev server
cd server && npm run lint     # Run ESLint
```

### Database
```bash
npx prisma migrate dev --name <name>   # Create + apply migration
npx prisma studio                       # Open DB GUI
npx prisma generate                     # Regenerate Prisma client
npx prisma db seed                      # Run seed script
npx prisma validate                     # Validate schema
```

### Git
```bash
git checkout -b feature/<name> development   # Create feature branch
git commit -m "feat: description"            # Conventional commit
git push origin feature/<name>               # Push feature branch
```

---

## Core Dependencies

### Frontend
`react`, `react-router-dom`, `zustand`, `tailwindcss`, `shadcn/ui`, `zod`

### Backend
`express`, `@prisma/client`, `@clerk/clerk-sdk-node`, `cloudinary`, `zod`

---

## Key URLs
| Purpose | URL |
|---------|-----|
| Landing | `stratumcms.com` |
| Dashboard | `app.stratumcms.com` |
| API Base | `api.stratumcms.com/api/v1/` |

---

## File Upload Constraints
- Supported formats: JPG, PNG, WebP, PDF
- Max file size: 5MB
- Storage: Cloudinary (URL stored in DB, not file)
- Single resume per user (replace on re-upload)
