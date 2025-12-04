import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db/mongo";
import Verification from "@/models/Verification";
import { verifySignature } from "@/lib/verification/crypto";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid verification ID" });
    }

    const verification = await Verification.findById(id)
      .populate("experimentId", "title protocol status version")
      .populate("createdBy", "name email")
      .lean();

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    // Verify signature
    const isValid = verifySignature(
      verification.hash,
      verification.signature,
      verification.publicKey
    );

    return res.status(200).json({
      verification: {
        id: verification._id.toString(),
        experimentId: verification.experimentId,
        hash: verification.hash,
        signature: verification.signature,
        publicKey: verification.publicKey,
        timestamp: verification.timestamp,
        createdBy: verification.createdBy,
        blockchainTxHash: verification.blockchainTxHash,
        metadata: verification.metadata,
      },
      isValid,
      message: isValid
        ? "Verification signature is valid"
        : "Verification signature is invalid",
    });
  } catch (error) {
    console.error("Verification check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
