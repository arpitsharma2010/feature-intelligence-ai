import { Prisma } from "@prisma/client";

import { isValidEmbedding } from "@/lib/ai/embedding";
import { prisma } from "@/lib/prisma";

export type CreateFeatureRequestInput = {
  title: string;
  description: string;
};

export async function listFeatureRequests() {
  return prisma.featureRequest.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      supportCount: true,
      createdAt: true,
    },
  });
}

export async function getFeatureRequest(id: string) {
  return prisma.featureRequest.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      supportCount: true,
      createdAt: true,
    },
  });
}

export async function createFeatureRequest(
  input: CreateFeatureRequestInput,
  embedding?: number[] | null,
) {
  return prisma.$transaction(async (transaction) => {
    const request = await transaction.featureRequest.create({
      data: input,
      select: { id: true },
    });

    if (isValidEmbedding(embedding)) {
      const vector = `[${embedding.join(",")}]`;
      await transaction.$executeRaw(
        Prisma.sql`UPDATE "FeatureRequest"
          SET "embedding" = ${vector}::vector
          WHERE "id" = ${request.id}`,
      );
    }

    return request;
  });
}

export async function incrementFeatureRequestSupport(id: string) {
  return prisma.featureRequest.update({
    where: { id },
    data: {
      supportCount: { increment: 1 },
    },
    select: { supportCount: true },
  });
}
