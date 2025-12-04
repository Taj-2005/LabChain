import type { NextApiRequest, NextApiResponse } from "next";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import type {
  ProtocolBlock,
  AISuggestion,
  AIStandardizationResponse,
} from "@/lib/types/protocol";

/**
 * AI endpoint to suggest improvements for protocol blocks
 * Analyzes blocks and suggests missing or standardized values
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

    verifyToken(token);

    const { blocks } = req.body;

    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({ error: "blocks array is required" });
    }

    // Generate AI suggestions based on block types
    const suggestions: AISuggestion[] = [];

    blocks.forEach((block: ProtocolBlock) => {
      // Suggest temperature values for temperature blocks
      if (block.type === "temperature") {
        if (!block.temperature || block.temperature === 0) {
          suggestions.push({
            blockId: block.id,
            field: "temperature",
            currentValue: block.temperature,
            suggestedValue: 37, // Common lab temperature
            reason: "Standard incubation temperature for biological samples",
          });
        }
        if (!block.duration) {
          suggestions.push({
            blockId: block.id,
            field: "duration",
            currentValue: block.duration,
            suggestedValue: 3600, // 1 hour
            reason: "Common duration for temperature-controlled steps",
          });
        }
      }

      // Suggest durations for timer blocks
      if (block.type === "timer") {
        if (!block.duration || block.duration === 0) {
          suggestions.push({
            blockId: block.id,
            field: "duration",
            currentValue: block.duration,
            suggestedValue: 300, // 5 minutes
            reason: "Standard short incubation time",
          });
        }
      }

      // Suggest quantities for reagent blocks
      if (block.type === "reagent") {
        if (!block.quantity || block.quantity === 0) {
          suggestions.push({
            blockId: block.id,
            field: "quantity",
            currentValue: block.quantity,
            suggestedValue: 1,
            reason: "Standard starting quantity",
          });
        }
        if (!block.unit || block.unit === "") {
          suggestions.push({
            blockId: block.id,
            field: "unit",
            currentValue: block.unit,
            suggestedValue: "ml",
            reason: "Common unit for liquid reagents",
          });
        }
      }

      // Suggest content for text blocks
      if (block.type === "text") {
        if (!block.content || block.content.trim() === "") {
          suggestions.push({
            blockId: block.id,
            field: "content",
            currentValue: block.content,
            suggestedValue: "Add step description here",
            reason: "Text step requires content",
          });
        }
      }

      // Suggest equipment names
      if (block.type === "equipment") {
        if (!block.equipmentName || block.equipmentName.trim() === "") {
          suggestions.push({
            blockId: block.id,
            field: "equipmentName",
            currentValue: block.equipmentName,
            suggestedValue: "Standard Lab Equipment",
            reason: "Equipment name is required",
          });
        }
      }
    });

    // In production, this would call:
    // - OpenAI API for intelligent suggestions
    // - Hugging Face inference API
    // - Custom ML models trained on protocol data

    const response: AIStandardizationResponse = {
      suggestions,
      confidence: suggestions.length > 0 ? 0.85 : 0,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("AI standardization error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
