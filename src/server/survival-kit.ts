import { asc, count, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { survivalKitTags } from "@/server/db/schema";
import { survivalTags as fallbackSurvivalTags, type SurvivalTag } from "@/lib/content";
import type { ColorCategory } from "@/types/project";

const isColorCategory = (value: string): value is ColorCategory => ["green", "orange", "red", "blue"].includes(value);

export const ensureSurvivalKitTags = async (): Promise<void> => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "survival_kit_tags" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "label" varchar(80) NOT NULL,
      "color_category" varchar(16) NOT NULL,
      "sort_order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "survival_kit_tags_sort_idx" ON "survival_kit_tags" ("sort_order")`);
};

export const getSurvivalKitTags = async (): Promise<SurvivalTag[]> => {
  try {
    await ensureSurvivalKitTags();
    const [{ totalTags }] = await db.select({ totalTags: count() }).from(survivalKitTags);

    if (totalTags === 0) {
      await db.insert(survivalKitTags).values(
        fallbackSurvivalTags.map((tag, index) => ({
          label: tag.label,
          colorCategory: tag.color,
          sortOrder: index + 1
        }))
      );
    }

    const rows = await db.select().from(survivalKitTags).orderBy(asc(survivalKitTags.sortOrder));
    return rows.map((tag) => ({
      label: tag.label,
      color: isColorCategory(tag.colorCategory) ? tag.colorCategory : "green"
    }));
  } catch {
    return fallbackSurvivalTags;
  }
};
