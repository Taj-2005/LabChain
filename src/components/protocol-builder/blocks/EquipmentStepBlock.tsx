"use client";

import { motion } from "framer-motion";
import type { EquipmentStepBlock as EquipmentStepBlockType } from "@/lib/types/protocol";

interface EquipmentStepBlockProps {
  block: EquipmentStepBlockType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function EquipmentStepBlock({
  block,
  index,
  isSelected,
  onClick,
  onDelete,
}: EquipmentStepBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${
          isSelected
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-sm font-semibold text-orange-700 dark:text-orange-300">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              Equipment
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
              {block.equipmentName || "Unnamed equipment"}
            </p>
            {block.notes && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                {block.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
