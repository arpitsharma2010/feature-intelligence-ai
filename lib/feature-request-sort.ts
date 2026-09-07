import type { Prisma } from "@prisma/client";

export type FeatureRequestSort = "recent" | "supported";

export const defaultFeatureRequestSort: FeatureRequestSort = "recent";

export const featureRequestOrderBy = {
  recent: [{ createdAt: "desc" }, { id: "desc" }],
  supported: [{ supportCount: "desc" }, { createdAt: "desc" }, { id: "desc" }],
} satisfies Record<
  FeatureRequestSort,
  Prisma.FeatureRequestOrderByWithRelationInput[]
>;

// Allow-list rather than a rejection list, so a missing, empty, repeated
// (`string[]`) or unknown `?sort=` value falls back to the default order.
export function normalizeFeatureRequestSort(value: unknown): FeatureRequestSort {
  return value === "supported" ? "supported" : defaultFeatureRequestSort;
}
