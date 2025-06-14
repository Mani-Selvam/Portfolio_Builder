import {
  users,
  submissions,
  projects,
  type User,
  type UpsertUser,
  type InsertSubmission,
  type Submission,
  type InsertProject,
  type Project,
  type SubmissionWithProjects
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<SubmissionWithProjects[]>;
  getSubmissionById(id: number): Promise<SubmissionWithProjects | undefined>;
  updateSubmissionStatus(id: number, status: string, completed?: boolean): Promise<Submission | undefined>;
  
  // Project operations
  createProjects(submissionId: number, projects: InsertProject[]): Promise<Project[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Submission operations
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values({
        ...submission,
        updatedAt: new Date(),
      })
      .returning();
    return newSubmission;
  }

  async getSubmissions(): Promise<SubmissionWithProjects[]> {
    const submissionsData = await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt));

    const submissionsWithProjects = await Promise.all(
      submissionsData.map(async (submission) => {
        const projectsData = await db
          .select()
          .from(projects)
          .where(eq(projects.submissionId, submission.id));
        
        return {
          ...submission,
          projects: projectsData,
        };
      })
    );

    return submissionsWithProjects;
  }

  async getSubmissionById(id: number): Promise<SubmissionWithProjects | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));

    if (!submission) return undefined;

    const projectsData = await db
      .select()
      .from(projects)
      .where(eq(projects.submissionId, id));

    return {
      ...submission,
      projects: projectsData,
    };
  }

  async updateSubmissionStatus(id: number, status: string, completed?: boolean): Promise<Submission | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const [updatedSubmission] = await db
      .update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();

    return updatedSubmission;
  }

  // Project operations
  async createProjects(submissionId: number, projectsData: InsertProject[]): Promise<Project[]> {
    if (projectsData.length === 0) return [];

    const projectsWithSubmissionId = projectsData.map(project => ({
      ...project,
      submissionId,
    }));

    const newProjects = await db
      .insert(projects)
      .values(projectsWithSubmissionId)
      .returning();

    return newProjects;
  }
}

export const storage = new DatabaseStorage();
