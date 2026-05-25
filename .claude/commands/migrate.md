Run a Prisma migration for Stratum CMS.

1. Navigate to `/server`
2. Run `npx prisma migrate dev --name $ARGUMENTS`
   - If no name argument was provided, ask for a short migration name before running
3. Run `npx prisma generate` to regenerate the Prisma client
4. Confirm the migration was applied successfully by checking the output
5. If the migration failed, show the error and suggest running `/db-reset` if the schema is in a bad state

Do NOT run `prisma db push` — always use `migrate dev` for trackable migrations.
