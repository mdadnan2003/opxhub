import { boolean, json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  full_name: text("full_name").notNull().default(""),
  headline: text("headline").notNull().default(""),
  college: text("college").notNull().default(""),
  course: text("course").notNull().default(""),
  grad_year: text("grad_year"),
  location: text("location"),
  about: text("about").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  onboarded: boolean("onboarded").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  author_id: uuid("author_id").notNull(),
  body: text("body").notNull(),
  kind: text("kind"),
  title: text("title"),
  image_url: text("image_url"),
  metadata: json("metadata"),
  is_published: boolean("is_published").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  description: text("description").notNull(),
  opportunity_type: text("opportunity_type").notNull().default("Internship"),
  category: text("category").notNull().default("Engineering"),
  details_url: text("details_url"),
  registration_url: text("registration_url"),
  deadline: timestamp("deadline", { withTimezone: true }),
  eligibility: text("eligibility"),
  location: text("location"),
  work_mode: text("work_mode").notNull().default("Remote"),
  paid_status: text("paid_status"),
  is_verified: boolean("is_verified").notNull().default(false),
  is_published: boolean("is_published").notNull().default(false),
  is_featured: boolean("is_featured").notNull().default(false),
  image_url: text("image_url"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
