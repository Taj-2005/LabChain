"use client";

import { motion } from "framer-motion";
import type { TextStepBlock as TextStepBlockType } from "@/lib/types/protocol";

interface TextStepBlockProps {
  block: TextStepBlockType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function TextStepBlock({
  block,
  index,
  isSelected,
  onClick,
  onDelete,
}: TextStepBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Text Step
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
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
            {block.content || "Empty text step"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
