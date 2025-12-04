"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { useExperiment } from "@/hooks/useExperiments";

export default function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { experiment, isLoading, error } = useExperiment(id);

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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {experiment.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Owner: {experiment.owner.name} ({experiment.owner.email})
                </p>
              </div>
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
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Protocol
              </h2>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-auto">
                {JSON.stringify(experiment.protocol, null, 2)}
              </pre>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Version: {experiment.version}</p>
              <p>Created: {new Date(experiment.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(experiment.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
