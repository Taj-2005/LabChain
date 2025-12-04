"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { useExperiment } from "@/hooks/useExperiments";
import {
  startReplication,
  updateReplication,
  getReplications,
  type ReplicationAttempt,
} from "@/lib/api/replication";
import { useToast } from "@/components/Toast";

export default function ReplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const { experiment, isLoading, mutate } = useExperiment(id);
  const { showToast } = useToast();
  const [replications, setReplications] = useState<ReplicationAttempt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"success" | "failure" | "">("");
  const [formResults, setFormResults] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAttempt, setEditingAttempt] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  // Load replications
  const loadReplications = async () => {
    if (!token) return;
    const data = await getReplications(id, token);
    if (data) {
      setReplications(data);
    }
  };

  useEffect(() => {
    if (token && id) {
      loadReplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id, experiment]);

  const handleStartReplication = async () => {
    if (!token) return;
    setIsSubmitting(true);

    const result = await startReplication(id, token, formNotes);
    if (result.success) {
      showToast("Replication attempt started", "success");
      setShowForm(false);
      setFormNotes("");
      await mutate();
      await loadReplications();
    } else {
      showToast(result.error || "Failed to start replication", "error");
    }
    setIsSubmitting(false);
  };

  const handleUpdateReplication = async (attemptId: string) => {
    if (!token) return;
    setIsSubmitting(true);

    const updates: {
      completedAt?: string;
      notes?: string;
      results?: Record<string, unknown>;
    } = {};

    if (formStatus) {
      updates.completedAt = new Date().toISOString();
    }
    if (formNotes) {
      updates.notes = formNotes;
    }
    if (formResults) {
      try {
        updates.results = JSON.parse(formResults);
      } catch {
        showToast("Invalid JSON in results field", "error");
        setIsSubmitting(false);
        return;
      }
    }

    const result = await updateReplication(id, attemptId, updates, token);
    if (result.success) {
      showToast("Replication updated", "success");
      setEditingAttempt(null);
      setFormNotes("");
      setFormStatus("");
      setFormResults("");
      await mutate();
      await loadReplications();
    } else {
      showToast(result.error || "Failed to update replication", "error");
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">Experiment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              ← Back
            </button>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Replication Tracking
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {experiment.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingAttempt(null);
                  setFormNotes("");
                  setFormStatus("");
                  setFormResults("");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                + Start Replication
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingAttempt
                  ? "Update Replication"
                  : "Start New Replication"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Enter replication notes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
                {editingAttempt && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(
                            e.target.value as "success" | "failure" | ""
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="">Select status...</option>
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Results (JSON format, optional)
                      </label>
                      <textarea
                        value={formResults}
                        onChange={(e) => setFormResults(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                        rows={4}
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (editingAttempt) {
                        handleUpdateReplication(editingAttempt);
                      } else {
                        handleStartReplication();
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingAttempt
                        ? "Update"
                        : "Start Replication"}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingAttempt(null);
                      setFormNotes("");
                      setFormStatus("");
                      setFormResults("");
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Replications List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Replication Attempts ({replications.length})
            </h2>
            {replications.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  No replication attempts yet. Start your first replication
                  above.
                </p>
              </div>
            ) : (
              replications.map((attempt, index) => (
                <div
                  key={attempt.attemptId || index}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Attempt {index + 1}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            attempt.completedAt
                              ? attempt.results?.status === "success" ||
                                (typeof attempt.results === "object" &&
                                  attempt.results &&
                                  "status" in attempt.results &&
                                  attempt.results.status === "success")
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {attempt.completedAt
                            ? attempt.results?.status === "success" ||
                              (typeof attempt.results === "object" &&
                                attempt.results &&
                                "status" in attempt.results &&
                                attempt.results.status === "success")
                              ? "Completed (Success)"
                              : "Completed (Failure)"
                            : "In Progress"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <span className="font-medium">Started:</span>{" "}
                          {new Date(attempt.startedAt).toLocaleString()}
                        </p>
                        {attempt.completedAt && (
                          <p>
                            <span className="font-medium">Completed:</span>{" "}
                            {new Date(attempt.completedAt).toLocaleString()}
                          </p>
                        )}
                        {attempt.experimenter && (
                          <p>
                            <span className="font-medium">By:</span>{" "}
                            {typeof attempt.experimenter === "object"
                              ? attempt.experimenter.name
                              : "Unknown"}
                          </p>
                        )}
                      </div>
                    </div>
                    {!attempt.completedAt && (
                      <button
                        onClick={() => {
                          setEditingAttempt(attempt.attemptId);
                          setShowForm(true);
                          setFormNotes(attempt.notes || "");
                          setFormStatus("");
                          setFormResults(
                            attempt.results
                              ? JSON.stringify(attempt.results, null, 2)
                              : ""
                          );
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Update
                      </button>
                    )}
                  </div>
                  {attempt.notes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {attempt.notes}
                      </p>
                    </div>
                  )}
                  {attempt.results && (
                    <details className="mt-3">
                      <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer font-medium">
                        View Results
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto">
                        {JSON.stringify(attempt.results, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
