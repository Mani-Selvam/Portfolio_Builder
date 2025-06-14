import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import session from "express-session";

// Extend session type to include isAdmin
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('application/')) {
        cb(null, true);
      } else {
        cb(new Error('Resume must be a PDF file'));
      }
    } else if (file.fieldname === 'profilePhoto' || file.fieldname.startsWith('projectScreenshot')) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Images must be image files'));
      }
    } else {
      cb(null, true);
    }
  }
});

const submissionFormSchema = insertSubmissionSchema.extend({
  projects: z.array(insertProjectSchema).optional().default([]),
});

// Simple admin authentication middleware
const isAdminAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration for admin login
  app.use(session({
    secret: process.env.SESSION_SECRET || 'admin-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Simple admin login
  app.post('/api/admin/login', (req: any, res) => {
    const { username, password } = req.body;
    
    // Simple credential check - in production, use proper password hashing
    if (username === 'admin' && password === 'admin123') {
      req.session.isAdmin = true;
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Admin logout
  app.post('/api/admin/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
      } else {
        res.json({ message: "Logout successful" });
      }
    });
  });

  // Check admin status
  app.get('/api/admin/status', (req: any, res) => {
    if (req.session && req.session.isAdmin) {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });

  // Serve uploaded files
  app.get('/api/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Client submission route (public, no auth required)
  app.post('/api/submissions', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'projectScreenshots', maxCount: 10 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const body = JSON.parse(req.body.data || '{}');
      
      // Handle file URLs first
      let profilePhotoUrl = null;
      let resumeUrl = null;
      
      if (files.profilePhoto && files.profilePhoto[0]) {
        profilePhotoUrl = `/api/uploads/${files.profilePhoto[0].filename}`;
      }
      
      if (files.resume && files.resume[0]) {
        resumeUrl = `/api/uploads/${files.resume[0].filename}`;
      } else {
        return res.status(400).json({ message: "Resume is required" });
      }

      // Add file URLs to body data for validation
      const dataWithFiles = {
        ...body,
        profilePhotoUrl,
        resumeUrl,
      };
      
      // Validate the complete submission data
      const validatedData = submissionFormSchema.parse(dataWithFiles);
      
      // Remove projects from submission data
      const { projects: projectsData, ...submissionOnly } = validatedData;
      
      const newSubmission = await storage.createSubmission(submissionOnly);
      
      // Handle project screenshots and create projects
      if (projectsData && projectsData.length > 0) {
        const projectsWithScreenshots = projectsData.map((project, index) => {
          let screenshotUrl = null;
          if (files.projectScreenshots && files.projectScreenshots[index]) {
            screenshotUrl = `/api/uploads/${files.projectScreenshots[index].filename}`;
          }
          return {
            ...project,
            screenshotUrl,
          };
        });
        
        await storage.createProjects(newSubmission.id, projectsWithScreenshots);
      }
      
      res.status(201).json({ 
        message: "Submission created successfully",
        submissionId: newSubmission.id
      });
    } catch (error) {
      console.error("Error creating submission:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create submission" });
      }
    }
  });

  // Admin routes (protected)
  app.get('/api/admin/submissions', isAdminAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/admin/submissions/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const submission = await storage.getSubmissionById(id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.patch('/api/admin/submissions/:id/status', isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, completed } = req.body;
      
      const updatedSubmission = await storage.updateSubmissionStatus(id, status, completed);
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(500).json({ message: "Failed to update submission status" });
    }
  });

  // Download file route
  app.get('/api/admin/download/:filename', isAdminAuthenticated, (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filepath)) {
      res.download(filepath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
