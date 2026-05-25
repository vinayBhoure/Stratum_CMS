Reset the Stratum CMS database completely and start fresh.

⚠️ This is destructive — all data will be lost. Confirm with the developer before proceeding.

1. Navigate to `/server`
2. Run `npx prisma migrate reset --force`
   - This drops the database, recreates it, runs all migrations, and runs the seed script
3. Run `npx prisma generate` to ensure the client is in sync
4. Confirm the reset completed successfully
5. Remind the developer that any test user accounts or content will need to be recreated
