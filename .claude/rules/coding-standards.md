# Coding Standards

## JavaScript Rules

### ESLint Configuration
Instead of TypeScript strict mode, we use ESLint to maintain code quality and catch common errors.

```json
// .eslintrc.json
{
  "extends": "eslint:recommended",
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-undef": "error",
    "eqeqeq": "error",
    "curly": "error"
  }
}
```

### Type Hinting with JSDoc
Since we don't have static types, use JSDoc to document expected types for better IDE support and maintainability.

❌ **Bad:**
```javascript
function fetchData(id) { ... }
```

✅ **Good:**
```javascript
/**
 * @param {string|number} id
 */
function fetchData(id) { ... }
```

### Documenting Return Values
Always document what a function returns using JSDoc.

❌ **Bad:**
```javascript
function getUser(id) {
  return prisma.user.findUnique({ where: { id } });
}
```

✅ **Good:**
```javascript
/**
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getUser(id) {
  return prisma.user.findUnique({ where: { id } });
}
```

## Naming Conventions

### Variables & Functions
- **camelCase**: `getUserById`, `projectList`
- **Boolean prefix**: `isAuthenticated`, `hasPermission`
- **Async functions**: Use `async` keyword and descriptive names.

### Data Structures & Classes
- **PascalCase**: `User`, `ProjectResponse`

### Constants
- **SCREAMING_SNAKE_CASE**: `API_BASE_URL`, `MAX_FILE_SIZE`

### Files
- **kebab-case**: `user-service.js`, `project-controller.js`
- **Component files**: `ProjectCard.jsx` (PascalCase for React)

## Code Organization

### Import Order
```javascript
// 1. External libraries
import express from 'express';
import { PrismaClient } from '@prisma/client';

// 2. Internal modules
import { AuthMiddleware } from '@/middlewares/auth';
import { validateProject } from '@/utils/validation';

// 3. Asset imports (CSS, Images)
import './styles.css';
```

### File Structure (Backend)
```javascript
// 1. Imports
// 2. Constants
// 3. Main logic
// 4. Exports

// Example:
const MAX_PROJECTS = 100;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createProject(req, res) {
  // Implementation
}
```

## Error Handling

### Always Use Try-Catch for Async
❌ **Bad:**
```javascript
export async function getProjects(req, res) {
  const projects = await prisma.project.findMany();
  res.json(projects);
}
```

✅ **Good:**
```javascript
export async function getProjects(req, res) {
  try {
    const projects = await prisma.project.findMany();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch projects' 
    });
  }
}
```

### Custom Error Classes
```javascript
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## React Component Standards

### Functional Components Only
❌ **Bad:**
```javascript
class ProjectCard extends React.Component { ... }
```

✅ **Good:**
```javascript
export function ProjectCard({ project }) { ... }
```

### Prop Documentation
Use JSDoc to define the expected props for a component.

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

## Linting & Formatting

### ESLint
Run before committing:
```bash
npm run lint
```

### Prettier
Auto-format on save (VSCode):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Comments

### When to Comment
✅ **Do comment:**
- Complex business logic
- Non-obvious workarounds
- TODOs with ticket references

❌ **Don't comment:**
- Obvious code (`// Increment counter`)
- Redundant descriptions (`// This function adds two numbers`)

### JSDoc for Public APIs
```javascript
/**
 * Fetches a project by ID
 * @param {string} id - The project UUID
 * @returns {Promise<Object|null>} The project object or null if not found
 * @throws {ValidationError} If ID format is invalid
 */
export async function getProjectById(id) {
  // Implementation
}
```