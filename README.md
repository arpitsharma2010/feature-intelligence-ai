# Feature Intelligence System

Initial application foundation built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Zod.

## Local development

Use Node.js 22.13 or newer within the Node 22 LTS release line. If you use nvm, run `nvm use` from the project root.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace its placeholders with a PostgreSQL connection string.
3. Generate the Prisma Client with `npx prisma generate`.
4. Start the application with `npm run dev`.
