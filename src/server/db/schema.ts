import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description").notNull(),
    whyBuilt: text("why_built").notNull(),
    imageUrl: text("image_url"),
    visible: boolean("visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    slugIdx: index("projects_slug_idx").on(table.slug),
    visibleCreatedIdx: index("projects_visible_created_idx").on(table.visible, table.createdAt)
  })
);

export const projectTechStack = pgTable(
  "project_tech_stack",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }).notNull(),
    colorCategory: varchar("color_category", { length: 16 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    projectSortIdx: index("project_tech_stack_project_sort_idx").on(table.projectId, table.sortOrder)
  })
);

export const projectLinks = pgTable(
  "project_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }).notNull(),
    url: text("url").notNull(),
    visible: boolean("visible").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    projectSortIdx: index("project_links_project_sort_idx").on(table.projectId, table.sortOrder)
  })
);

export const survivalKitTags = pgTable(
  "survival_kit_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    label: varchar("label", { length: 80 }).notNull(),
    colorCategory: varchar("color_category", { length: 16 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    sortIdx: index("survival_kit_tags_sort_idx").on(table.sortOrder)
  })
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull().default("admin"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 64 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    userIdx: index("admin_sessions_user_idx").on(table.userId),
    expiresIdx: index("admin_sessions_expires_idx").on(table.expiresAt)
  })
);

export const adminAuthenticators = pgTable(
  "admin_authenticators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull().unique(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    transports: text("transports"),
    deviceType: varchar("device_type", { length: 32 }).notNull().default("single_device"),
    backedUp: boolean("backed_up").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
  },
  (table) => ({
    userIdx: index("admin_authenticators_user_idx").on(table.userId)
  })
);

export const adminTwoFactorSecrets = pgTable("admin_2fa_secrets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }).unique(),
  secretEncrypted: text("secret_encrypted").notNull(),
  recoveryCodesHash: text("recovery_codes_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    actionIdx: index("audit_logs_action_idx").on(table.action),
    createdIdx: index("audit_logs_created_idx").on(table.createdAt)
  })
);

export const projectsRelations = relations(projects, ({ many }) => ({
  techStack: many(projectTechStack),
  links: many(projectLinks)
}));
