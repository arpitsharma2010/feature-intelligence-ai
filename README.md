# Feature Intelligence System

Discover, submit, view, and support product feature requests. The application is built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Zod. New submissions are checked against existing requests by an AI duplicate-triage step before they are saved.

## Local development

Use Node.js 22.13 or newer within the Node 22 LTS release line. If you use nvm, run `nvm use` from the project root.

PostgreSQL must be able to install the `pgvector` extension; the embedding migration runs `CREATE EXTENSION IF NOT EXISTS vector`.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to a PostgreSQL connection string and `OPENAI_API_KEY` to an OpenAI API key. `.env` is git-ignored; never commit real credentials.
3. Apply the database migrations with `npm run db:migrate`.
4. Populate demo requests with `npm run db:seed`.
5. Generate embeddings for the seeded requests with `npm run db:backfill-embeddings`.
6. Start the application with `npm run dev`.

The discover page is available at `/`, and new requests can be submitted at `/requests/new`.

## AI duplicate triage

When a request is submitted, a LangGraph workflow embeds the draft, retrieves the three nearest existing requests by pgvector cosine distance, and asks a classifier whether the draft duplicates one of them. A `duplicate` verdict at 0.85 confidence or higher shows the matched request and asks the submitter to choose **Support existing** or **Create separately**; the decision is always the human's.

- Triage runs under a single 8-second budget shared across the embedding, retrieval, and classification steps. Every step is capped by the remaining budget, and provider retries are disabled.
- The workflow fails open. A missing API key, a timeout, a provider error, or malformed classifier output all fall back to creating the request normally, and the reason is logged without provider detail.
- The classifier may only name a request that retrieval actually returned, and its output is schema-validated before use.
- Embeddings stay server-side. Vectors are never included in the state returned to the browser.

Behaviour is configurable through `.env` — see `.env.example` for the model names and the total, embedding, and classification timeouts.

## Database commands

- `npm run db:migrate` applies development migrations and generates Prisma Client.
- `npm run db:seed` inserts the idempotent demo dataset.
- `npm run db:backfill-embeddings` embeds every request whose `embedding` is null. It is idempotent and safe to re-run; a second run reports zero attempts. It exits non-zero if any request fails.
- `npx prisma validate` validates the Prisma schema and database configuration.

## Quality checks

- `npm test` runs the AI duplicate-triage test suite with `node:test`.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs the TypeScript compiler with no emit.
- `npm run build` produces the production build.
