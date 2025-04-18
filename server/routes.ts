// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs"; // Still potentially needed for cleanup if using temp files, but less so with memory storage
// Import Supabase client
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User as SupabaseUser } from "@supabase/supabase-js"; // Import Supabase User type

// Remove custom auth imports
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken"; // Remove jsonwebtoken

import {
  insertDocumentSchema,
  insertReminderSchema, // insertUserSchema, // Remove or adjust if user creation is purely Supabase Auth
} from "@shared/schema";

// Remove JWT secret
// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// --- Supabase Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use the Service Role Key on the server

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required."
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET;

if (!storageBucket) {
  throw new Error("SUPABASE_STORAGE_BUCKET environment variable is required.");
}
// --- End Supabase Initialization ---

// --- Document Processing Imports (Assume they can handle buffers) ---
// We need to update these functions (which we don't have access to)
// to accept a buffer or stream instead of a local file path.
// For example:
// import { analyzeDocument } from "./services/anthropic"; // Assume analyzeDocument can take text or maybe buffer
// import { extractTextFromPdfBuffer, extractTextFromImageBuffer } from "./services/documentProcessor"; // Assuming new functions

// Placeholder imports assuming updated functions
import { analyzeDocument } from "./services/anthropic"; // This service likely works on text
import {
  extractTextFromPdf as extractTextFromPdfOriginal, // Rename original
  extractTextFromImage as extractTextFromImageOriginal, // Rename original
} from "./services/documentProcessor";

// Define types for the potentially updated functions if they take buffers
type ExtractTextFromBuffer = (buffer: Buffer) => Promise<string>;

// IMPORTANT: These functions need to be implemented/updated to work with Buffers/Streams!
// For demonstration, creating wrapper functions that would call the updated service functions.
const extractTextFromPdf: ExtractTextFromBuffer = async (buffer) => {
  console.warn(
    "WARNING: Using placeholder for extractTextFromPdf that expects a buffer."
  ); // You would call your actual updated service function here // return await extractTextFromPdfBuffer(buffer); // For now, returning dummy text or trying to make the original work with a temp file (less ideal) // Or if your original function is smart enough, maybe it works with paths directly IF we save temporarily? // Let's assume for this refactor the services ARE updated to take Buffers. // Dummy implementation:
  return Promise.resolve("Extracted text placeholder from PDF buffer.");
};

const extractTextFromImage: ExtractTextFromBuffer = async (buffer) => {
  console.warn(
    "WARNING: Using placeholder for extractTextFromImage that expects a buffer."
  ); // You would call your actual updated service function here // return await extractTextFromImageBuffer(buffer); // Dummy implementation:
  return Promise.resolve("Extracted text placeholder from Image buffer.");
};
// --- End Document Processing Imports ---

// Configure multer for file uploads, using memory storage
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as a Buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit (same as before)
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

// --- Supabase Authentication Middleware ---
// This middleware checks for a Supabase token and verifies it.
// Using Service Role Key for verification for reliability on the server.
const authenticateSupabaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    // No token, deny access
    return res.sendStatus(401); // Unauthorized
  }

  try {
    // Verify the token using the service role key (server-side)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Supabase Auth Verification Error:", error?.message);
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired token" }); // Forbidden
    } // Attach the Supabase User object to the request. // The user.id is the UUID that links to our public.users table.

    (req as any).user = user;
    next(); // Proceed to the next middleware/route handler
  } catch (error: any) {
    console.error("Authentication middleware error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};
// --- End Supabase Authentication Middleware ---

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Remove custom auth routes ---
  // app.post("/api/auth/register", ...);
  // app.post("/api/auth/login", ...);
  // --- End Remove custom auth routes ---

  // Apply Supabase authentication middleware to protected routes
  app.use("/api/documents", authenticateSupabaseToken);
  app.use("/api/reminders", authenticateSupabaseToken); // Document routes (now protected and using Supabase Storage)

  app.post(
    "/api/documents",
    upload.single("file"), // Use multer to handle file upload (memory storage)
    async (req: Request, res: Response) => {
      try {
        // Access user ID (UUID) from the request object set by authenticateSupabaseToken
        const userId = (req as any).user.id; // Supabase User ID is a UUID string
        console.log("Authenticated User ID:", userId); // Add this line
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.file;
        const title = req.body.title || path.parse(file.originalname).name; // --- Upload file to Supabase Storage ---

        const fileExtension = path.extname(file.originalname); // Generate a unique file path in Supabase Storage, possibly including user ID
        const supabaseFilePath = `${userId}/${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${fileExtension}`;

console.log("Supabase Upload Path:", supabaseFilePath); // Add this line
console.log("Storage Bucket:", storageBucket); // Add this line near the top where storageBucket is defined
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(storageBucket)
          .upload(supabaseFilePath, file.buffer, {
            // Upload using the buffer from memory storage
            contentType: file.mimetype,
            upsert: false, // Avoid overwriting if path somehow exists
          });

        if (uploadError) {
          console.error("Supabase Storage Upload Error:", uploadError);
          throw new Error(
            `Failed to upload file to storage: ${uploadError.message}`
          );
        } // The filePath stored in DB should be the path within the Supabase bucket

        const storedFilePath = uploadData.path; // Use the path returned by Supabase // --- End Upload file to Supabase Storage --- // --- Extract text and Analyze Document --- // Now, pass the file buffer to your extraction functions
        let extractedText = "";
        if (file.mimetype === "application/pdf") {
          // Call the updated function that takes a buffer
          extractedText = await extractTextFromPdf(file.buffer);
        } else if (file.mimetype.startsWith("image/")) {
          // Call the updated function that takes a buffer
          extractedText = await extractTextFromImage(file.buffer);
        } else {
          // Handle other allowed types if extraction is possible, or set placeholder
          extractedText =
            "Text extraction not supported for this file type yet.";
        } // Analyze the document with AI using the extracted text

        const analysis = await analyzeDocument(extractedText); // --- End Extract text and Analyze Document --- // Create document record in database
        const documentData = {
          userId: userId, // Use the authenticated user's UUID
          title: title,
          originalFilename: file.originalname,
          fileType: file.mimetype,
          filePath: storedFilePath, // Store the Supabase Storage path
        }; // Validate data including the UUID userId

        const validatedData = insertDocumentSchema.parse(documentData);
        const document = await storage.createDocument(validatedData); // Update with analysis results

        await storage.updateDocumentAnalysis(document.id, {
          summary: analysis.summary,
          actionItems: analysis.actionItems,
          tags: analysis.tags,
          status: "processed",
        }); // Fetch the updated document to return

        const updatedDocument = await storage.getDocument(document.id);

        res.status(201).json(updatedDocument);
      } catch (error: any) {
        console.error("Document upload/processing error:", error); // Handle file cleanup in Supabase Storage on error if necessary // This is more complex as you need the path after attempted upload. // For simplicity, we won't add Supabase storage cleanup here, but consider it for production.
        res.status(500).json({
          message:
            error.message || "An error occurred while processing the document",
        });
      }
    }
  );

  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      // Access user ID (UUID) from the request object set by authenticateSupabaseToken
      const userId = (req as any).user.id; // Supabase User ID is a UUID string // Use the authenticated user's UUID to fetch documents

      const documents = await storage.getDocumentsByUserId(userId);
      res.status(200).json(documents);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      res.status(500).json({
        message: error.message || "An error occurred while fetching documents",
      });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id); // Get userId from token (UUID)
      const userId = (req as any).user.id;

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ message: "Valid document ID is required" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      } // IMPORTANT: Authorization check - ensure the document belongs to the authenticated user (by UUID)

      if (document.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Document does not belong to user" });
      } // --- Optional: Generate a signed URL for direct file access --- // You might want to include a temporary URL for the frontend to view the file. // Requires Supabase Storage policy (RLS) configuration or using a signed URL. // const { data: signedUrlData, error: signedUrlError } = await supabase.storage //   .from(storageBucket) //   .createSignedUrl(document.filePath, 60 * 5); // URL valid for 5 minutes // if (signedUrlError) { //   console.error("Error creating signed URL:", signedUrlError); //   // Decide how to handle this - maybe still return doc but no URL? // } // const documentWithUrl = { //   ...document, //   fileUrl: signedUrlData?.signedUrl || null, // }; // res.status(200).json(documentWithUrl); // --- End Optional Signed URL --- // For now, just return the document data as before, but ensure userId matches

      res.status(200).json(document);
    } catch (error: any) {
      console.error("Error retrieving document:", error);
      res.status(500).json({
        message: error.message || "An error occurred while retrieving document",
      });
    }
  }); // Reminders routes (now protected and using UUID userId)

  app.post("/api/reminders", async (req: Request, res: Response) => {
    try {
      // Get userId from token (UUID)
      const userId = (req as any).user.id;
      const reminderData = { ...req.body, userId }; // Add userId (UUID) from token // Validate data including the UUID userId

      const validatedData = insertReminderSchema.parse(reminderData);
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error: any) {
      console.error("Error creating reminder:", error);
      res.status(400).json({
        message: error.message || "An error occurred while creating reminder",
      });
    }
  });

  app.get("/api/reminders", async (req: Request, res: Response) => {
    try {
      // Use the authenticated user's UUID to fetch reminders
      const userId = (req as any).user.id;

      const reminders = await storage.getRemindersByUserId(userId);
      res.status(200).json(reminders);
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({
        message: error.message || "An error occurred while fetching reminders",
      });
    }
  });

  app.patch("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id); // Get userId from token (UUID)
      const userId = (req as any).user.id;

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ message: "Valid reminder ID is required" });
      }

      const reminder = await storage.getReminder(id);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      } // IMPORTANT: Authorization check - ensure the reminder belongs to the authenticated user (by UUID)

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
      res.status(500).json({
        message: error.message || "An error occurred while updating reminder",
      });
    }
  }); // AI follow-up question route (now protected and using Supabase Storage)

  app.post("/api/documents/:id/ask", async (req: Request, res: Response) => {
    try {
      const docId = parseInt(req.params.id); // Get userId from token (UUID)
      const userId = (req as any).user.id;
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      const document = await storage.getDocument(docId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      } // IMPORTANT: Authorization check

      if (document.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Document does not belong to user" });
      } // --- Fetch file content from Supabase Storage --- // Use the filePath stored in the database

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(storageBucket)
        .download(document.filePath); // Download using the stored path

      if (downloadError || !fileData) {
        console.error("Supabase Storage Download Error:", downloadError);
        throw new Error(
          `Failed to download file from storage: ${
            downloadError?.message || "File data empty"
          }`
        );
      } // fileData is a Blob, convert to Buffer for processing functions

      const fileBuffer = Buffer.from(await fileData.arrayBuffer()); // --- End Fetch file content from Supabase Storage --- // --- Extract text and Get AI response --- // Extract text based on file type, now passing the buffer
      let documentText = "";
      if (document.fileType === "application/pdf") {
        documentText = await extractTextFromPdf(fileBuffer); // Pass buffer
      } else if (document.fileType.startsWith("image/")) {
        documentText = await extractTextFromImage(fileBuffer); // Pass buffer
      } else {
        documentText =
          document.summary ||
          "Text extraction not supported for this file type yet."; // Fallback to summary?
      } // Get AI response to the question using the extracted text and question

      const response = await analyzeDocument(documentText, question); // Assuming analyzeDocument takes text and question // --- End Extract text and Get AI response ---
      res.status(200).json({ answer: response.answer });
    } catch (error: any) {
      console.error("Error asking document question:", error);
      res.status(500).json({
        message:
          error.message || "An error occurred while processing your question",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
