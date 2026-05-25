Run lint checks with auto-fix across the entire Stratum CMS codebase.

1. Run in `/server`: `npx eslint src/ --ext .ts --fix`
2. Run in `/client`: `npx eslint src/ --ext .ts,.tsx --fix`
3. Run Prettier fix in both:
   - `cd server && npx prettier --write "src/**/*.ts"`
   - `cd client && npx prettier --write "src/**/*.{ts,tsx,css}"`
4. Report what was auto-fixed and what still requires manual attention
