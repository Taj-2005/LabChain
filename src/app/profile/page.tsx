"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import ImageUpload from "@/components/ImageUpload";
import type { CloudinaryImage } from "@/lib/cloudinary/config";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<CloudinaryImage | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfileImage(
        (user as { profileImage?: CloudinaryImage }).profileImage || null
      );
    }
  }, [isAuthenticated, router, user]);

  const handleImageUpload = (image: CloudinaryImage) => {
    setProfileImage(image);
    // Auto-save profile image
    saveProfile({ profileImage: image });
  };

  const saveProfile = async (updates?: { profileImage?: CloudinaryImage }) => {
    if (!token) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updates ? undefined : name,
          profileImage: updates?.profileImage || profileImage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      showToast("Profile updated successfully", "success");
      // Refresh user data
      window.location.reload();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to update profile",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Profile Settings
          </h1>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
            {/* Profile Image */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profile Picture
              </h2>
              <ImageUpload
                onUploadComplete={handleImageUpload}
                folder="profiles"
                existingImage={profileImage}
                label=""
              />
            </div>

            {/* Profile Information */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
