import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db/mongo";
import Experiment from "@/models/Experiment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    req.method !== "GET" &&
    req.method !== "PATCH" &&
    req.method !== "DELETE"
  ) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid experiment ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid experiment ID format" });
    }

    if (req.method === "GET") {
      const experiment = await Experiment.findById(id)
        .populate("owner", "name email")
        .populate("replicationAttempts.experimenter", "name email")
        .lean();

      if (!experiment) {
        return res.status(404).json({ error: "Experiment not found" });
      }

      return res.status(200).json({ experiment });
    }

    if (req.method === "PATCH") {
      const experiment = await Experiment.findById(id);

      if (!experiment) {
        return res.status(404).json({ error: "Experiment not found" });
      }

      // Check ownership or permissions (for now, only owner can update)
      if (experiment.owner.toString() !== payload.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Conflict resolution: check version
      const clientVersion = req.body.version;
      if (clientVersion !== undefined && clientVersion !== experiment.version) {
        return res.status(409).json({
          error: "Version conflict",
          currentVersion: experiment.version,
          serverExperiment: await Experiment.findById(id).lean(),
        });
      }

      // Update fields
      const { title, protocol, status, notes } = req.body;

      if (title !== undefined) experiment.title = title;
      if (protocol !== undefined) {
        experiment.protocol = protocol;
        // Create new version if protocol changed
        experiment.versions.push({
          version: experiment.version + 1,
          protocol,
          createdAt: new Date(),
          notes,
        });
        experiment.version += 1;
      }
      if (status !== undefined) experiment.status = status;

      await experiment.save();

      const updated = await Experiment.findById(id)
        .populate("owner", "name email")
        .lean();

      return res.status(200).json({ experiment: updated });
    }

    if (req.method === "DELETE") {
      const experiment = await Experiment.findById(id);

      if (!experiment) {
        return res.status(404).json({ error: "Experiment not found" });
      }

      // Check ownership
      if (experiment.owner.toString() !== payload.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await Experiment.findByIdAndDelete(id);

      return res.status(200).json({ message: "Experiment deleted" });
    }
  } catch (error) {
    console.error("Experiment API error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
