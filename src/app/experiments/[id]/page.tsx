"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { useExperiment } from "@/hooks/useExperiments";
import { useSocket } from "@/hooks/useSocket";

export default function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const { experiment, isLoading, error, mutate } = useExperiment(id);
  const { isConnected, presence, joinExperiment, leaveExperiment } =
    useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");

  // Join experiment room when component mounts
  useEffect(() => {
    if (id && isConnected) {
      joinExperiment(id);
      return () => {
        leaveExperiment(id);
      };
    }
  }, [id, isConnected, joinExperiment, leaveExperiment]);

  // Initialize edit form
  useEffect(() => {
    if (experiment) {
      setEditTitle(experiment.title);
      setEditStatus(experiment.status);
    }
  }, [experiment]);

  if (!isAuthenticated()) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error ? "Failed to load experiment" : "Experiment not found"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            ← Back
          </button>

          {/* Real-time presence indicator */}
          {isConnected && presence.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                👥 {presence.length}{" "}
                {presence.length === 1 ? "person" : "people"} viewing this
                experiment
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-3xl font-bold"
                    />
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/experiments/${id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                title: editTitle,
                                status: editStatus,
                                version: experiment.version,
                              }),
                            });
                            if (res.ok) {
                              await mutate();
                              setIsEditing(false);
                            }
                          } catch (err) {
                            console.error("Error updating:", err);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditTitle(experiment.title);
                          setEditStatus(experiment.status);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {experiment.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Owner: {experiment.owner.name} ({experiment.owner.email})
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        experiment.status === "draft"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          : experiment.status === "active"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : experiment.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {experiment.status}
                    </span>
                    {String(
                      experiment.owner._id ||
                        (experiment.owner as { id?: string }).id
                    ) === useAuth.getState().user?.id && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => router.push(`/experiments/${id}/notebook`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  📓 Notebook
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Protocol
              </h2>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-auto">
                {JSON.stringify(experiment.protocol, null, 2)}
              </pre>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Version: {experiment.version}</p>
                <p>
                  Created: {new Date(experiment.createdAt).toLocaleString()}
                </p>
                <p>
                  Updated: {new Date(experiment.updatedAt).toLocaleString()}
                </p>
              </div>
              {String(
                experiment.owner._id || (experiment.owner as { id?: string }).id
              ) === useAuth.getState().user?.id && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/verify/stamp`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          experimentId: id,
                          data: {
                            title: experiment.title,
                            protocol: experiment.protocol,
                            version: experiment.version,
                          },
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        alert(
                          `Verification stamp created! ID: ${data.verification._id}`
                        );
                      }
                    } catch (err) {
                      console.error("Error creating verification:", err);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  🔒 Create Verification Stamp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
