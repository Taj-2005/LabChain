import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db/mongo";
import Experiment from "@/models/Experiment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);

    if (req.method === "GET") {
      // Get experiments with pagination and filters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const ownerOnly = req.query.ownerOnly === "true";

      const query: Record<string, unknown> = {};
      if (ownerOnly) {
        query.owner = payload.userId;
      }
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [experiments, total] = await Promise.all([
        Experiment.find(query)
          .populate("owner", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Experiment.countDocuments(query),
      ]);

      return res.status(200).json({
        experiments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    if (req.method === "POST") {
      // Create new experiment
      const { title, protocol, status } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const experiment = await Experiment.create({
        owner: payload.userId,
        title,
        protocol: protocol || {},
        status: status || "draft",
        version: 1,
        versions: [
          {
            version: 1,
            protocol: protocol || {},
            createdAt: new Date(),
          },
        ],
      });

      const populated = await Experiment.findById(experiment._id)
        .populate("owner", "name email")
        .lean();

      return res.status(201).json({ experiment: populated });
    }
  } catch (error) {
    console.error("Experiments API error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
