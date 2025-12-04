import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db/mongo";
import User from "@/models/User";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    if (error instanceof Error && error.message.includes("token")) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
