# Frontend Architecture — Stratum CMS

## Tech Stack
- **Framework**: React.js (Vite)
- **Language**: JavaScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (global state for user data, forms)
- **Routing**: React Router
- **Validation**: Zod (input validation)

---

## Folder Structure

```
/client/src
├── /components       # Reusable UI (buttons, modals, forms)
├── /pages            # Route-level components (Dashboard, Projects, API)
├── /features         # Feature-specific logic (ProjectForm, SkillList)
├── /services         # API client (fetch wrappers, endpoints)
├── /store            # Zustand stores (userStore, projectStore)
├── /utils            # Helpers (validation, formatters)
└── /assets           # Static files (icons, images)
```

---

## Key Patterns

### Component Structure
- Functional components only (no class components)
- JSDoc for prop documentation
- PascalCase filenames for React components: `ProjectCard.jsx`

```javascript
/**
 * @param {Object} props
 * @param {Object} props.project - The project data
 * @param {Function} [props.onEdit] - Optional edit callback
 * @param {boolean} [props.isLoading=false] - Loading state
 */
export function ProjectCard({
  project,
  onEdit,
  isLoading = false
}) {
  // Implementation
}
```

### Hooks Order
```javascript
function MyComponent() {
  // 1. State hooks
  const [data, setData] = useState([]);

  // 2. Context hooks
  const auth = useAuth();

  // 3. Ref hooks
  const inputRef = useRef(null);

  // 4. Effect hooks
  useEffect(() => { ... }, []);

  // 5. Custom hooks
  const { loading, error } = useFetch('/api/data');

  // 6. Event handlers
  const handleSubmit = () => { ... };

  // 7. Render
  return <div>...</div>;
}
```

### State Management (Zustand)
Stores are located in `/src/store/`:
- `userStore` — authenticated user data
- `projectStore` — project list and CRUD state

### API Service Layer
API client in `/src/services/`:
- Fetch wrappers for all backend endpoints
- Base URL: `https://api.stratumcms.com/api/v1/`
- Standard response handling: `{ success, data, error }`

### Import Order
```javascript
// 1. External libraries
import { useState, useEffect } from 'react';

// 2. Internal modules
import { ProjectCard } from '@/components/ProjectCard';
import { useProjectStore } from '@/store/projectStore';

// 3. Asset imports
import './styles.css';
```

---

## Pages (Route-Level)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard Home | `/` | Overview with empty state prompt |
| Projects | `/projects` | Card-based list, add/edit/delete |
| Experience | `/experience` | Work history management |
| Skills | `/skills` | Skill proficiency list |
| Contact | `/contact` | Social links and email |
| Resume | `/resume` | PDF upload and management |
| API Docs | `/api` | Integration guide with copy-paste snippets |

---

## UI Patterns
- Card-based list views for collections (Projects, Experience, Skills)
- Modal/drawer for add/edit forms
- Inline delete with confirmation dialog
- Toast notifications for CRUD feedback
- Loading and error states on all data-driven components
- Form validation with Zod

---

## Path Alias
`@/` is configured to point to `./src`:
- `vite.config.js` — resolve alias
- `jsconfig.json` — IDE support
