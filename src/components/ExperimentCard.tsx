"use client";

import Link from "next/link";
import { Experiment } from "@/hooks/useExperiments";

interface ExperimentCardProps {
  experiment: Experiment;
}

export default function ExperimentCard({ experiment }: ExperimentCardProps) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    archived:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };

  return (
    <Link
      href={`/experiments/${experiment._id}`}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {experiment.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Owner: {experiment.owner.name}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Version: {experiment.version}</span>
            <span>{new Date(experiment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[experiment.status]}`}
        >
          {experiment.status}
        </span>
      </div>
    </Link>
  );
}
