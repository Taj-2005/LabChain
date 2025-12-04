import type { NextApiRequest, NextApiResponse } from "next";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_CONFIG,
  UPLOAD_CONFIG,
  type CloudinaryImage,
} from "@/lib/cloudinary/config";
import formidable from "formidable";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify authentication
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    verifyToken(token);

    // Parse form data
    const form = formidable({
      maxFileSize: UPLOAD_CONFIG.maxFileSize,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const fileArray = Array.isArray(files.file)
      ? files.file
      : files.file
        ? [files.file]
        : [];

    if (fileArray.length === 0) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = fileArray[0];

    // Validate file type
    if (!file.mimetype || !UPLOAD_CONFIG.allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: `Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(", ")}`,
      });
    }

    // Validate file size
    if (file.size && file.size > UPLOAD_CONFIG.maxFileSize) {
      return res.status(400).json({
        error: `File too large. Maximum size: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`,
      });
    }

    if (!file.filepath) {
      return res.status(400).json({ error: "Invalid file" });
    }

    // Get upload folder from form fields (optional)
    const folder =
      (Array.isArray(fields.folder) ? fields.folder[0] : fields.folder) ||
      "labchain";

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder,
      resource_type: "image",
      transformation: [
        {
          width: UPLOAD_CONFIG.maxWidth,
          height: UPLOAD_CONFIG.maxHeight,
          crop: "limit",
        },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // Clean up temp file
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }

    const imageData: CloudinaryImage = {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };

    return res.status(200).json({
      success: true,
      image: imageData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
