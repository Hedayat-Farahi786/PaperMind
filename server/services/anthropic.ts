import Anthropic from "@anthropic-ai/sdk";

interface DocumentAnalysis {
  summary: string;
  actionItems: {
    task: string;
    dueDate?: string;
    priority?: string;
  }[];
  tags: string[];
  answer?: string;
}

export async function analyzeDocument(
  documentText: string,
  question?: string
): Promise<DocumentAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    let prompt = "";
    
    if (question) {
      // Handle follow-up question about the document
      prompt = `
The following is a document text:
---
${documentText}
---

Question about this document: "${question}"

Please answer this question based only on information from the document. If the answer cannot be determined from the document, say so clearly.
`;
    } else {
      // Initial document analysis
      prompt = `
Analyze the following document:
---
${documentText}
---

Please provide:
1. A concise summary of the key points (maximum 5 bullet points)
2. Action items required with deadlines if mentioned (format as JSON array with "task" and "dueDate" fields)
3. Relevant category tags for this document (maximum 5 tags)

Format your response as JSON with the following structure:
{
  "summary": "bullet point summary here",
  "actionItems": [{"task": "task description", "dueDate": "due date in this format YYYY-MM-DD (if available, if not then today's date)", "priority": "high/medium/low"}],
  "tags": ["tag1", "tag2", "tag3"]
}
`;
    }

    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-7-sonnet-20250219",
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response format from Anthropic");
    }

    if (question) {
      return {
        summary: "",
        actionItems: [],
        tags: [],
        answer: content.text,
      };
    }

    const jsonMatch =
      content.text.match(/```json\n([\s\S]*?)\n```/) ||
      content.text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Anthropic");
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const analysis = JSON.parse(jsonStr);

    return {
      summary: analysis.summary || "No summary provided",
      actionItems: analysis.actionItems || [],
      tags: analysis.tags || [],
    };
  } catch (error) {
    console.error("Error analyzing document with Anthropic:", error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}