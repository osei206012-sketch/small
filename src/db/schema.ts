import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"), // free | pro | business
  subscriptionStatus: text("subscription_status").notNull().default("active"), // active | canceled | expired
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("active"),
  interval: text("interval").notNull(), // monthly | yearly
  amount: doublePrecision("amount").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endsAt: timestamp("ends_at"),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("invoice"), // invoice | quote
  number: text("number").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientAddress: text("client_address"),
  issueDate: text("issue_date"),
  dueDate: text("due_date"),
  items: jsonb("items").notNull(),
  subtotal: doublePrecision("subtotal").notNull().default(0),
  taxRate: doublePrecision("tax_rate").notNull().default(0),
  taxAmount: doublePrecision("tax_amount").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft | sent | paid
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockItems = pgTable("stock_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku"),
  category: text("category"),
  quantity: integer("quantity").notNull().default(0),
  unitCost: doublePrecision("unit_cost").notNull().default(0),
  unitPrice: doublePrecision("unit_price").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(0),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cvs = pgTable("cvs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const flyers = pgTable("flyers", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const estimates = pgTable("estimates", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  data: jsonb("data").notNull(),
  totalCost: doublePrecision("total_cost").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type StockItem = typeof stockItems.$inferSelect;
export type Cv = typeof cvs.$inferSelect;
export type Flyer = typeof flyers.$inferSelect;
export type Estimate = typeof estimates.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
