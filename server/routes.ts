import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSubmissionSchema, insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      
      // Validate the submission data
      const validatedData = submissionFormSchema.parse(body);
      
      // Handle file URLs
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

      // Create submission
      const submissionData = {
        ...validatedData,
        profilePhotoUrl,
        resumeUrl,
      };
      
      // Remove projects from submission data
      const { projects: projectsData, ...submissionOnly } = submissionData;
      
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
  app.get('/api/admin/submissions', isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/admin/submissions/:id', isAuthenticated, async (req, res) => {
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

  app.patch('/api/admin/submissions/:id/status', isAuthenticated, async (req, res) => {
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
  app.get('/api/admin/download/:filename', isAuthenticated, (req, res) => {
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
