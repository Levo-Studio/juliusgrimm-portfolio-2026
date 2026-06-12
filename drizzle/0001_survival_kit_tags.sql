CREATE TABLE IF NOT EXISTS "survival_kit_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "label" varchar(80) NOT NULL,
  "color_category" varchar(16) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "survival_kit_tags_sort_idx" ON "survival_kit_tags" ("sort_order");
