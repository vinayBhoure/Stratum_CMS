Run the Prisma seed script for Stratum CMS.

1. Navigate to `/server`
2. Run `npx prisma db seed`
3. Confirm output shows the `featured` system tag was seeded (or already exists)
4. If seeding fails, show the error — common cause is the migration hasn't been run yet
