import { Prisma, PrismaClient } from "@prisma/client";

import { AI_TRIAGE_CONFIG } from "../lib/ai/config";
import {
  formatFeatureRequestInput,
  generateEmbedding,
} from "../lib/ai/embedding";
import { getOpenAIClient } from "../lib/ai/openai-client";

const prisma = new PrismaClient();
const batchSize = 8;

type Counts = {
  attempted: number;
  updated: number;
  skipped: number;
  failed: number;
};

async function main() {
  const counts: Counts = { attempted: 0, updated: 0, skipped: 0, failed: 0 };
  const requests = await prisma.$queryRaw<
    Array<{ id: string; title: string; description: string }>
  >`SELECT "id", "title", "description"
    FROM "FeatureRequest"
    WHERE "embedding" IS NULL
    ORDER BY "createdAt" ASC, "id" ASC`;

  let client: ReturnType<typeof getOpenAIClient>;
  try {
    client = getOpenAIClient();
  } catch {
    counts.attempted = requests.length;
    counts.failed = requests.length;
    report(counts);
    process.exitCode = requests.length > 0 ? 1 : 0;
    return;
  }

  for (let offset = 0; offset < requests.length; offset += batchSize) {
    const batch = requests.slice(offset, offset + batchSize);

    await Promise.all(
      batch.map(async (request) => {
        counts.attempted += 1;

        try {
          const embedding = await generateEmbedding(
            client,
            formatFeatureRequestInput(request),
            AI_TRIAGE_CONFIG.embeddingTimeoutMs,
          );
          const vector = `[${embedding.join(",")}]`;
          const updated = await prisma.$executeRaw(
            Prisma.sql`UPDATE "FeatureRequest"
              SET "embedding" = ${vector}::vector
              WHERE "id" = ${request.id} AND "embedding" IS NULL`,
          );

          if (updated === 1) {
            counts.updated += 1;
          } else {
            counts.skipped += 1;
          }
        } catch (error) {
          counts.failed += 1;
          console.error(`Failed to embed request ${request.id}.`);
          if (process.env.NODE_ENV === "development") {
            console.error(error);
          }
        }
      }),
    );
  }

  report(counts);
  process.exitCode = counts.failed > 0 ? 1 : 0;
}

function report(counts: Counts) {
  console.log(
    `Embedding backfill: attempted=${counts.attempted} updated=${counts.updated} skipped=${counts.skipped} failed=${counts.failed}`,
  );
}

main()
  .catch((error) => {
    console.error("Embedding backfill could not run.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
