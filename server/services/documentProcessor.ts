import fs from "fs";
import Tesseract from "tesseract.js";
// Use pdfreader library for PDF parsing
import { PdfReader } from "pdfreader";

/**
 * Extract text from a PDF file using pdfreader
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let pdfText = "";
    let currentPage = 0;

    new PdfReader({}).parseFileItems(filePath, (err, item) => {
      if (err) {
        console.error("Error parsing PDF:", err);
        reject(new Error(`Failed to parse PDF: ${err.message || err}`));
      } else if (!item) {
        // End of file processing
        resolve(pdfText.trim());
      } else if (item.page) {
         // Handle new page if needed (e.g., add page breaks)
         currentPage = item.page;
      } else if (item.text) {
        // Concatenate text items, adding a space between them
        pdfText += item.text + " ";
        // Add a newline character if the item indicates end of a line (heuristic)
        if (item.y !== undefined && item.y < (item.y + item.height)) {
             // Check if the next item likely starts a new line based on y-coordinate
             // This is a basic heuristic and might need refinement based on pdfreader's item structure
        }
      }
    });
  });
}


/**
 * Extract text from an image using OCR (Tesseract.js)
 */
export async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(filePath, "eng"); // Specify language if known
    return data.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text from image");
  }
}

/**
 * Process a document to extract text based on file type
 */
export async function processDocument(
  filePath: string,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractTextFromPdf(filePath);
  } else if (mimeType.startsWith("image/")) {
    // Handles common image types like jpeg, png, etc.
    return extractTextFromImage(filePath);
  } else {
    // Consider adding support for other types (e.g., .doc, .docx) or return a specific error
    console.warn(`Unsupported file type received for processing: ${mimeType}`);
    throw new Error(`Unsupported file type: ${mimeType}. Cannot extract text.`);
  }
}