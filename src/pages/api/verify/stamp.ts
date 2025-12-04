import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db/mongo";
import Verification from "@/models/Verification";
import Experiment from "@/models/Experiment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import {
  generateHash,
  generateKeyPair,
  signHash,
} from "@/lib/verification/crypto";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    const { experimentId, data, metadata } = req.body;

    if (!experimentId || !mongoose.Types.ObjectId.isValid(experimentId)) {
      return res.status(400).json({ error: "Valid experimentId is required" });
    }

    // Verify experiment exists and user has access
    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }

    // Check ownership or permissions
    if (experiment.owner.toString() !== payload.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Prepare data for hashing (include experiment data + provided data)
    const hashData = {
      experimentId: experiment._id.toString(),
      experimentVersion: experiment.version,
      protocol: experiment.protocol,
      status: experiment.status,
      timestamp: new Date().toISOString(),
      ...(data || {}),
    };

    // Generate hash
    const hash = generateHash(hashData);

    // Generate key pair and sign (in production, use stored user keys)
    const { privateKey, publicKey } = generateKeyPair();
    const signature = signHash(hash, privateKey);

    // Create verification record
    const verification = await Verification.create({
      experimentId: experiment._id,
      hash,
      signature,
      publicKey,
      timestamp: new Date(),
      createdBy: payload.userId,
      metadata: metadata || {},
    });

    return res.status(201).json({
      verification: {
        id: verification._id.toString(),
        hash,
        signature,
        publicKey,
        timestamp: verification.timestamp,
        experimentId: verification.experimentId.toString(),
      },
      message: "Experiment stamped and verified",
    });
  } catch (error) {
    console.error("Verification stamp error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
