import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  
  // Personal Details
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  profilePhotoUrl: varchar("profile_photo_url", { length: 500 }),
  
  // About Section
  professionalTitle: varchar("professional_title", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  
  // Education (Optional)
  degree: varchar("degree", { length: 255 }),
  university: varchar("university", { length: 255 }),
  graduationYear: varchar("graduation_year", { length: 10 }),
  
  // Work Experience (Optional)
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  duration: varchar("duration", { length: 100 }),
  
  // Resume & Social Links
  resumeUrl: varchar("resume_url", { length: 500 }).notNull(),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  portfolioUrl: varchar("portfolio_url", { length: 500 }),
  otherSocialUrl: varchar("other_social_url", { length: 500 }),
  
  // Status and metadata
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  completed: boolean("completed").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  submissionId: serial("submission_id").references(() => submissions.id),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  technologies: varchar("technologies", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  demoUrl: varchar("demo_url", { length: 500 }),
  screenshotUrl: varchar("screenshot_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  submissionId: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type SubmissionWithProjects = Submission & {
  projects: Project[];
};
