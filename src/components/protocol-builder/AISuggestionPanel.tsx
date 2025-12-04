"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AISuggestion } from "@/lib/types/protocol";

interface AISuggestionPanelProps {
  suggestions: AISuggestion[];
  isOpen: boolean;
  onClose: () => void;
  onAccept: (suggestion: AISuggestion) => void;
  onAcceptAll: () => void;
  onReject: (suggestionId: string) => void;
}

export default function AISuggestionPanel({
  suggestions,
  isOpen,
  onClose,
  onAccept,
  onAcceptAll,
  onReject,
}: AISuggestionPanelProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Suggestions
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No suggestions available</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <button
                      onClick={onAcceptAll}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Accept All Suggestions
                    </button>
                  </div>

                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={`${suggestion.blockId}-${suggestion.field}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                      >
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {suggestion.field}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.reason}
                          </p>
                        </div>
                        <div className="mb-3 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Current:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {suggestion.currentValue ?? "Not set"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Suggested:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {suggestion.suggestedValue}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onAccept(suggestion)}
                            className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              onReject(
                                `${suggestion.blockId}-${suggestion.field}-${index}`
                              )
                            }
                            className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
