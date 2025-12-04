import type { NextApiRequest, NextApiResponse } from "next";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";

/**
 * ML endpoint to standardize/transform raw protocol text into structured format.
 * This is a lightweight implementation that can call external ML services
 * (OpenAI, Hugging Face, etc.) or be replaced with a heavy ML server if needed.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    verifyToken(token); // Verify user is authenticated

    const { rawText, experimentId } = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText is required" });
    }

    // Stub implementation: Basic text parsing
    // In production, this would call:
    // - OpenAI API for structured extraction
    // - Hugging Face inference API
    // - Custom ML model endpoint
    // - Or proxy to ml-server if heavy processing needed

    const standardizedProtocol = {
      steps: parseTextToSteps(rawText),
      metadata: {
        source: "voice-input",
        timestamp: new Date().toISOString(),
        experimentId: experimentId || null,
      },
    };

    return res.status(200).json({
      protocol: standardizedProtocol,
      confidence: 0.85, // Stub confidence score
    });
  } catch (error) {
    console.error("ML standardization error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Simple text parser - replace with actual ML model in production
 */
function parseTextToSteps(text: string): Array<{
  id: string;
  type: string;
  content: string;
  order: number;
}> {
  // Split by sentences and create steps
  const sentences = text
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences.map((sentence, index) => {
    // Simple heuristics to determine step type
    let type = "step";
    const lower = sentence.toLowerCase();
    if (
      lower.includes("measure") ||
      lower.includes("record") ||
      lower.includes("observe")
    ) {
      type = "measurement";
    } else if (lower.includes("note") || lower.includes("remember")) {
      type = "note";
    }

    return {
      id: `step-${Date.now()}-${index}`,
      type,
      content: sentence,
      order: index,
    };
  });
}
