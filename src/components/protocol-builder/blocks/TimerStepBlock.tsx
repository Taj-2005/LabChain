"use client";

import { motion } from "framer-motion";
import type { TimerStepBlock as TimerStepBlockType } from "@/lib/types/protocol";

interface TimerStepBlockProps {
  block: TimerStepBlockType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default function TimerStepBlock({
  block,
  index,
  isSelected,
  onClick,
  onDelete,
}: TimerStepBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold text-purple-700 dark:text-purple-300">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Timer
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              {block.label || "Timer"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Duration: {formatDuration(block.duration)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
