"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  updateProtocol,
  getProtocol,
  type ProtocolStep,
} from "@/lib/api/protocol";
import { useAuth } from "@/stores/useAuth";
import { useToast } from "./Toast";

interface ProtocolBuilderEnhancedProps {
  experimentId: string;
  initialProtocol?: ProtocolStep[];
  initialVersion?: number;
  onVersionChange?: (newVersion: number) => void;
}

export default function ProtocolBuilderEnhanced({
  experimentId,
  initialProtocol = [],
  initialVersion = 1,
  onVersionChange,
}: ProtocolBuilderEnhancedProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [protocol, setProtocol] = useState<ProtocolStep[]>(initialProtocol);
  const [currentVersion, setCurrentVersion] = useState(initialVersion);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  // Debounced autosave (700ms)
  const debouncedSave = useCallback(
    (protocolToSave: ProtocolStep[]) => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        if (!token) return;

        const protocolString = JSON.stringify(protocolToSave);
        if (protocolString === lastSavedRef.current) {
          return; // No changes
        }

        setIsSaving(true);
        const result = await updateProtocol(
          experimentId,
          { steps: protocolToSave },
          currentVersion,
          token
        );

        if (result.success) {
          lastSavedRef.current = protocolString;
          setHasUnsavedChanges(false);
          if (result.newVersion) {
            setCurrentVersion(result.newVersion);
            onVersionChange?.(result.newVersion);
          }
          showToast("Protocol saved", "success", 2000);
        } else {
          showToast(result.error || "Failed to save", "error");
        }
        setIsSaving(false);
      }, 700);
    },
    [experimentId, currentVersion, token, onVersionChange, showToast]
  );

  // Update protocol and trigger autosave
  const updateProtocolState = useCallback(
    (newProtocol: ProtocolStep[]) => {
      setProtocol(newProtocol);
      setHasUnsavedChanges(true);
      debouncedSave(newProtocol);
    },
    [debouncedSave]
  );

  // Add step
  const addStep = (type: ProtocolStep["type"]) => {
    const newStep: ProtocolStep = {
      id: `step-${Date.now()}-${Math.random()}`,
      type,
      content: "",
      order: protocol.length,
    };
    updateProtocolState([...protocol, newStep]);
  };

  // Update step
  const updateStep = (id: string, updates: Partial<ProtocolStep>) => {
    updateProtocolState(
      protocol.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
  };

  // Delete step
  const deleteStep = (id: string) => {
    const newProtocol = protocol.filter((step) => step.id !== id);
    // Reorder remaining steps
    newProtocol.forEach((step, index) => {
      step.order = index;
    });
    updateProtocolState(newProtocol);
  };

  // Move step up
  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newProtocol = [...protocol];
    [newProtocol[index - 1], newProtocol[index]] = [
      newProtocol[index],
      newProtocol[index - 1],
    ];
    newProtocol.forEach((step, i) => {
      step.order = i;
    });
    updateProtocolState(newProtocol);
  };

  // Move step down
  const moveStepDown = (index: number) => {
    if (index === protocol.length - 1) return;
    const newProtocol = [...protocol];
    [newProtocol[index], newProtocol[index + 1]] = [
      newProtocol[index + 1],
      newProtocol[index],
    ];
    newProtocol.forEach((step, i) => {
      step.order = i;
    });
    updateProtocolState(newProtocol);
  };

  // Load protocol on mount
  useEffect(() => {
    if (token && experimentId && initialProtocol.length === 0) {
      getProtocol(experimentId, token).then((data) => {
        if (data) {
          setProtocol(data.protocol);
          setCurrentVersion(data.version);
          lastSavedRef.current = JSON.stringify(data.protocol);
        }
      });
    }
  }, [experimentId, token, initialProtocol.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Header with save status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Protocol Steps
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Version {currentVersion}
          </span>
          {isSaving && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Saving...
            </span>
          )}
          {hasUnsavedChanges && !isSaving && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => addStep("step")}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Step
          </button>
          <button
            onClick={() => addStep("note")}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Note
          </button>
          <button
            onClick={() => addStep("measurement")}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            + Measurement
          </button>
        </div>
      </div>

      {/* Protocol steps */}
      <div className="space-y-3">
        {protocol.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            No protocol steps yet. Add your first step above.
          </div>
        ) : (
          protocol
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Order and move buttons */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => moveStepUp(index)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveStepDown(index)}
                    disabled={index === protocol.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                {/* Step content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        step.type === "step"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : step.type === "note"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      }`}
                    >
                      {step.type}
                    </span>
                    <button
                      onClick={() => deleteStep(step.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <textarea
                    value={step.content}
                    onChange={(e) =>
                      updateStep(step.id, { content: e.target.value })
                    }
                    placeholder={`Enter ${step.type} content...`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
