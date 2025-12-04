import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db/mongo";
import Experiment from "@/models/Experiment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    verifyToken(token); // Verify token but don't need payload for notes endpoint
    const { id } = req.query;

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid experiment ID" });
    }

    const experiment = await Experiment.findById(id);

    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }

    if (req.method === "POST") {
      const { notes, rawText } = req.body;

      // Autosave notes
      if (notes !== undefined) {
        // Update the latest version's notes if it exists
        if (experiment.versions.length > 0) {
          experiment.versions[experiment.versions.length - 1].notes = notes;
        }
        await experiment.save();
      }

      // If rawText is provided, trigger ML transformation (stub)
      if (rawText) {
        // In a real implementation, this would call the ML service
        // For now, return a structured protocol suggestion
        const structuredProtocol = {
          steps: rawText
            .split(/[.!?]\s+/)
            .filter((s: string) => s.trim().length > 0)
            .map((sentence: string, index: number) => ({
              id: `step-${index}`,
              type: "step",
              content: sentence.trim(),
              order: index,
            })),
        };

        return res.status(200).json({
          message: "Notes saved",
          structuredProtocol,
        });
      }

      return res.status(200).json({ message: "Notes saved" });
    }

    if (req.method === "GET") {
      const latestVersion = experiment.versions[experiment.versions.length - 1];
      return res.status(200).json({
        notes: latestVersion?.notes || "",
      });
    }
  } catch (error) {
    console.error("Notes API error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
