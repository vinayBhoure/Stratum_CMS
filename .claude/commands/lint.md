Run lint checks across the entire Stratum CMS codebase without fixing.

1. Run in `/server`: `npx eslint src/ --ext .ts`
2. Run in `/client`: `npx eslint src/ --ext .ts,.tsx`
3. Run Prettier check in both:
   - `cd server && npx prettier --check "src/**/*.ts"`
   - `cd client && npx prettier --check "src/**/*.{ts,tsx,css}"`
4. Report all issues found — group by server vs client
5. If there are auto-fixable issues, suggest running `/lint-fix`
