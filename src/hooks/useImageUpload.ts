"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/stores/useAuth";
import type { CloudinaryImage } from "@/lib/cloudinary/config";

interface UseImageUploadOptions {
  folder?: string;
  onSuccess?: (image: CloudinaryImage) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<CloudinaryImage | null>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = useCallback(
    async (file: File): Promise<CloudinaryImage | null> => {
      if (!token) {
        const err = "Authentication required";
        setError(err);
        options.onError?.(err);
        return null;
      }

      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
          );
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`File too large. Maximum size: 5MB`);
        }

        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        if (options.folder) {
          formData.append("folder", options.folder);
        }

        // Upload to our API
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        const image: CloudinaryImage = data.image;

        setProgress(100);
        options.onSuccess?.(image);
        return image;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [token, options]
  );

  return {
    uploadImage,
    isUploading,
    error,
    progress,
  };
}
