# Feature Intelligence System

Discover, submit, view, and support product feature requests. The application is built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Zod.

## Local development

Use Node.js 22.13 or newer within the Node 22 LTS release line. If you use nvm, run `nvm use` from the project root.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace its placeholders with a PostgreSQL connection string.
3. Apply the database migrations with `npm run db:migrate`.
4. Populate demo requests with `npm run db:seed`.
5. Start the application with `npm run dev`.

The discover page is available at `/`, and new requests can be submitted at `/requests/new`.

## Database commands

- `npm run db:migrate` applies development migrations and generates Prisma Client.
- `npm run db:seed` inserts the idempotent demo dataset.
- `npx prisma validate` validates the Prisma schema and database configuration.
