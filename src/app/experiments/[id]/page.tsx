"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/stores/useAuth";
import { useExperiment } from "@/hooks/useExperiments";
import { useSocket } from "@/hooks/useSocket";
import ProtocolBuilderEnhanced from "@/components/ProtocolBuilderEnhanced";
import ImageUpload from "@/components/ImageUpload";

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
  const [isEditingProtocol, setIsEditingProtocol] = useState(false);
  const [protocolBlocks] = useState<
    Array<{
      id: string;
      type: "step" | "note" | "measurement";
      content: string;
      order: number;
    }>
  >([]);
  const [showReplicationForm, setShowReplicationForm] = useState(false);

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
            {/* Experiment Image Section */}
            {String(
              experiment.owner._id || (experiment.owner as { id?: string }).id
            ) === useAuth.getState().user?.id && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Experiment Image
                </h2>
                <ImageUpload
                  onUploadComplete={async (img) => {
                    if (!token) return;
                    try {
                      const res = await fetch(`/api/experiments/${id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          image: img,
                          version: experiment.version,
                        }),
                      });
                      if (res.ok) {
                        await mutate();
                      }
                    } catch (err) {
                      console.error("Error updating image:", err);
                    }
                  }}
                  folder="experiments"
                  existingImage={experiment.image}
                  label="Upload Experiment Image (Optional)"
                />
              </div>
            )}

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
                <button
                  onClick={() => router.push(`/experiments/${id}/replications`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  🔄 Replications
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Protocol
                </h2>
                <div className="flex gap-2">
                  {!isEditingProtocol &&
                    String(
                      experiment.owner._id ||
                        (experiment.owner as { id?: string }).id
                    ) === useAuth.getState().user?.id && (
                      <>
                        <Link
                          href={`/protocols/${id}/builder`}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          🎨 Visual Builder
                        </Link>
                        <button
                          onClick={() => setIsEditingProtocol(true)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          ✏️ Edit Protocol
                        </button>
                      </>
                    )}
                </div>
              </div>

              {isEditingProtocol ? (
                <div className="space-y-4">
                  <ProtocolBuilderEnhanced
                    experimentId={id}
                    initialProtocol={protocolBlocks}
                    initialVersion={experiment.version}
                    onVersionChange={() => {
                      mutate();
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingProtocol(false);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Close Editor
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                  {protocolBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {protocolBlocks
                        .sort((a, b) => a.order - b.order)
                        .map((block, index) => (
                          <div
                            key={block.id || index}
                            className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                {index + 1}.
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  block.type === "step"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : block.type === "note"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                }`}
                              >
                                {block.type}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              {block.content}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(experiment.protocol, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Attachments Section */}
            {String(
              experiment.owner._id || (experiment.owner as { id?: string }).id
            ) === useAuth.getState().user?.id && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Attachments
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {experiment.attachments?.map((attachment, index) => (
                    <div
                      key={attachment.public_id || index}
                      className="relative group"
                    >
                      <div className="relative w-full h-32">
                        <Image
                          src={attachment.secure_url}
                          alt={`Attachment ${index + 1}`}
                          fill
                          className="object-cover rounded-md border border-gray-300 dark:border-gray-700"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!token) return;
                          try {
                            const updatedAttachments =
                              experiment.attachments?.filter(
                                (a) => a.public_id !== attachment.public_id
                              ) || [];
                            const res = await fetch(`/api/experiments/${id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                attachments: updatedAttachments,
                                version: experiment.version,
                              }),
                            });
                            if (res.ok) {
                              await mutate();
                            }
                          } catch (err) {
                            console.error("Error deleting attachment:", err);
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <ImageUpload
                  onUploadComplete={async (img) => {
                    if (!token) return;
                    try {
                      const currentAttachments = experiment.attachments || [];
                      const res = await fetch(`/api/experiments/${id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          attachments: [...currentAttachments, img],
                          version: experiment.version,
                        }),
                      });
                      if (res.ok) {
                        await mutate();
                      }
                    } catch (err) {
                      console.error("Error adding attachment:", err);
                    }
                  }}
                  folder={`experiments/${id}/attachments`}
                  label="Add Attachment"
                />
              </div>
            )}

            {/* Replication Attempts Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Replication Attempts
                </h2>
                <button
                  onClick={() => setShowReplicationForm(!showReplicationForm)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {showReplicationForm ? "Cancel" : "+ New Replication"}
                </button>
              </div>

              {showReplicationForm && (
                <ReplicationForm
                  experimentId={id}
                  token={token || ""}
                  onSuccess={async () => {
                    await mutate();
                    setShowReplicationForm(false);
                  }}
                />
              )}

              {experiment.replicationAttempts &&
              experiment.replicationAttempts.length > 0 ? (
                <div className="space-y-3">
                  {experiment.replicationAttempts.map((attempt, index) => (
                    <div
                      key={attempt.attemptId || index}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Attempt {index + 1}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Started:{" "}
                            {new Date(attempt.startedAt).toLocaleString()}
                          </p>
                          {attempt.completedAt && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Completed:{" "}
                              {new Date(attempt.completedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            attempt.completedAt
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {attempt.completedAt ? "Completed" : "In Progress"}
                        </span>
                      </div>
                      {attempt.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {attempt.notes}
                        </p>
                      )}
                      {attempt.results && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer">
                            View Results
                          </summary>
                          <pre className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                            {JSON.stringify(attempt.results, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No replication attempts yet.
                </p>
              )}
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
                        if (data.verification) {
                          alert(
                            `✅ Verification stamp created!\n\nID: ${data.verification.id}\nHash: ${data.verification.hash?.substring(0, 20) || "N/A"}...\nTimestamp: ${data.verification.timestamp ? new Date(data.verification.timestamp).toLocaleString() : "N/A"}`
                          );
                        } else {
                          alert(
                            `✅ Verification created! ${data.message || ""}`
                          );
                        }
                      } else {
                        const errorData = await res
                          .json()
                          .catch(() => ({ error: "Unknown error" }));
                        alert(
                          `❌ Failed to create verification: ${errorData.error || "Unknown error"}`
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

// Replication Form Component
function ReplicationForm({
  experimentId,
  token,
  onSuccess,
}: {
  experimentId: string;
  token: string;
  onSuccess: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/experiments/${experimentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          replicationAttempt: {
            attemptId: `attempt-${Date.now()}`,
            startedAt: new Date().toISOString(),
            notes: notes || undefined,
            results: results ? JSON.parse(results) : undefined,
          },
          version: 0, // Will be handled by server
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create replication attempt");
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create replication attempt"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
    >
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded text-sm">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes about this replication attempt..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Results (JSON format, optional)
          </label>
          <textarea
            value={results}
            onChange={(e) => setResults(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Replication"}
          </button>
        </div>
      </div>
    </form>
  );
}
