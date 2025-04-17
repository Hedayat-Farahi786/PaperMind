import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // Assuming storage is your database layer
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeDocument } from "./services/anthropic";
import {
  extractTextFromPdf,
  extractTextFromImage,
} from "./services/documentProcessor";
import {
  insertDocumentSchema,
  insertReminderSchema,
  insertUserSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // Import jsonwebtoken

// IMPORTANT: Use environment variables for your JWT Secret!
// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Define your secret here
// For demonstration purposes, using a placeholder. Replace this!
const JWT_SECRET = "a_very_insecure_default_secret_CHANGE_ME_IN_PROD";
if (
  process.env.NODE_ENV !== "production" &&
  JWT_SECRET === "a_very_insecure_default_secret_CHANGE_ME_IN_PROD"
) {
  console.warn(
    "WARNING: Using default JWT secret. Change JWT_SECRET environment variable in production!"
  );
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/tiff",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, images, and documents are allowed."
        ) as any
      );
    }
  },
});

// Middleware to verify JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    // No token, deny access
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      // Token is not valid or expired
      console.error("JWT Verification Error:", err.message);
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired token" }); // Forbidden
    }
    // Token is valid, attach user info from payload to request
    // We expect the payload to have { userId: ..., username: ... }
    (req as any).user = user; // Attach user payload to request object
    next(); // Proceed to the next middleware/route handler
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: "24h" } // Token expires in 24 hours
      );

      // Return token and minimal user info
      res.status(201).json({
        token,
        user: { id: newUser.id, username: newUser.username },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res
        .status(400)
        .json({
          message: error.message || "An error occurred during registration",
        });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = insertUserSchema
        .pick({ username: true, password: true })
        .parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" } // Token expires in 24 hours
      );

      // Return token and minimal user info
      res.status(200).json({
        token,
        user: { id: user.id, username: user.username },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res
        .status(401)
        .json({ message: error.message || "An error occurred during login" });
    }
  });

  // Apply JWT authentication middleware to protected routes
  app.use("/api/documents", authenticateToken);
  app.use("/api/reminders", authenticateToken);

  // Document routes (now protected)
  app.post(
    "/api/documents",
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        // Access user ID from the request object set by authenticateToken middleware
        const userId = (req as any).user.userId; // Make sure your JWT payload includes userId

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // const userId = parseInt(req.body.userId); // <-- REMOVE THIS, get userId from token
        const title = req.body.title || path.parse(req.file.originalname).name;

        // Ensure the authenticated user ID matches any potential userId passed in body (optional but good practice)
        // if (parseInt(req.body.userId) !== userId) {
        //      return res.status(403).json({ message: "Forbidden: User ID mismatch" });
        // }

        // Extract text based on file type
        let extractedText = "";
        if (req.file.mimetype === "application/pdf") {
          extractedText = await extractTextFromPdf(req.file.path);
        } else if (req.file.mimetype.startsWith("image/")) {
          extractedText = await extractTextFromImage(req.file.path);
        } else {
          extractedText =
            "Text extraction not supported for this file type yet.";
        }

        // Analyze the document with AI
        // This part might also need authentication if analyzeDocument makes external calls,
        // but for now, assuming it's an internal service call.
        const analysis = await analyzeDocument(extractedText);

        // Create document record
        const documentData = {
          userId, // Use the authenticated userId
          title,
          originalFilename: req.file.originalname,
          fileType: req.file.mimetype,
          filePath: req.file.path,
        };

        const validatedData = insertDocumentSchema.parse(documentData);
        const document = await storage.createDocument(validatedData);

        // Update with analysis results
        await storage.updateDocumentAnalysis(document.id, {
          summary: analysis.summary,
          actionItems: analysis.actionItems,
          tags: analysis.tags,
          status: "processed",
        });

        // Fetch the updated document to return
        const updatedDocument = await storage.getDocument(document.id);

        res.status(201).json(updatedDocument);
      } catch (error: any) {
        console.error("Document upload error:", error);
        // Ensure file is removed if processing fails
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res
          .status(500)
          .json({
            message:
              error.message ||
              "An error occurred while processing the document",
          });
      }
    }
  );

  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      // Access user ID from the request object set by authenticateToken middleware
      const userId = (req as any).user.userId; // Use the authenticated userId

      // const userId = parseInt(req.query.userId as string); // <-- REMOVE THIS, get userId from token
      // if (isNaN(userId)) { // <-- NO LONGER NEEDED if using middleware
      //   return res.status(400).json({ message: "Valid userId is required" });
      // }

      const documents = await storage.getDocumentsByUserId(userId);
      res.status(200).json(documents);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching documents",
        });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user.userId; // Get userId from token

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ message: "Valid document ID is required" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // IMPORTANT: Add authorization check - ensure the document belongs to the authenticated user
      if (document.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Document does not belong to user" });
      }

      res.status(200).json(document);
    } catch (error: any) {
      console.error("Error retrieving document:", error);
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while retrieving document",
        });
    }
  });

  // Reminders routes (now protected)
  app.post("/api/reminders", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId; // Get userId from token
      const reminderData = { ...req.body, userId }; // Add userId from token
      const validatedData = insertReminderSchema.parse(reminderData);
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error: any) {
      console.error("Error creating reminder:", error);
      res
        .status(400)
        .json({
          message: error.message || "An error occurred while creating reminder",
        });
    }
  });

  app.get("/api/reminders", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId; // Use the authenticated userId

      // const userId = parseInt(req.query.userId as string); // <-- REMOVE THIS
      // if (isNaN(userId)) { // <-- NO LONGER NEEDED
      //   return res.status(400).json({ message: "Valid userId is required" });
      // }

      const reminders = await storage.getRemindersByUserId(userId);
      res.status(200).json(reminders);
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while fetching reminders",
        });
    }
  });

  app.patch("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user.userId; // Get userId from token

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ message: "Valid reminder ID is required" });
      }

      const reminder = await storage.getReminder(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      // IMPORTANT: Add authorization check
      if (reminder.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Reminder does not belong to user" });
      }

      const { completed } = req.body;
      const updatedReminder = await storage.updateReminder(id, { completed });
      res.status(200).json(updatedReminder);
    } catch (error: any) {
      console.error("Error updating reminder:", error);
      res
        .status(500)
        .json({
          message: error.message || "An error occurred while updating reminder",
        });
    }
  });

  // AI follow-up question route (now protected)
  app.post("/api/documents/:id/ask", async (req: Request, res: Response) => {
    try {
      const docId = parseInt(req.params.id);
      const userId = (req as any).user.userId; // Get userId from token
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      const document = await storage.getDocument(docId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // IMPORTANT: Add authorization check
      if (document.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Document does not belong to user" });
      }

      // Extract text from document if needed
      let documentText = "";
      if (document.fileType === "application/pdf") {
        documentText = await extractTextFromPdf(document.filePath);
      } else if (document.fileType.startsWith("image/")) {
        documentText = await extractTextFromImage(document.filePath);
      } else {
        documentText = "Text extraction not supported for this file type yet.";
      }

      // Get AI response to the question
      // This part might also need authentication
      const response = await analyzeDocument(documentText, question);

      res.status(200).json({ answer: response.answer });
    } catch (error: any) {
      console.error("Error asking document question:", error);
      res
        .status(500)
        .json({
          message:
            error.message || "An error occurred while processing your question",
        });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
