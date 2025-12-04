"use client";

import { useState, useMemo } from "react";
import type {
  ProtocolBlock,
  TextStepBlock,
  TimerStepBlock,
  TemperatureStepBlock,
  ReagentStepBlock,
  EquipmentStepBlock,
} from "@/lib/types/protocol";

interface InspectorPanelProps {
  block: ProtocolBlock | null;
  onUpdate: (block: ProtocolBlock) => void;
  onClose: () => void;
}

export default function InspectorPanel({
  block,
  onUpdate,
  onClose,
}: InspectorPanelProps) {
  // Use useMemo to derive formData from block, avoiding setState in effect
  const initialFormData = useMemo(() => {
    return block ? { ...block } : {};
  }, [block]);

  const [formData, setFormData] =
    useState<Partial<ProtocolBlock>>(initialFormData);

  // Update formData when block changes - use key prop on parent would be better, but this works
  if (block && formData.id !== block.id) {
    setFormData({ ...block });
  }

  if (!block) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (block) {
      onUpdate({ ...block, ...formData } as ProtocolBlock);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Block
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {block.type === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={(formData as TextStepBlock).content || ""}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
              />
            </div>
          )}

          {block.type === "timer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={(formData as TimerStepBlock).label || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Incubation time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={(formData as TimerStepBlock).duration || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {block.type === "temperature" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={(formData as TemperatureStepBlock).label || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Heating step"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  value={(formData as TemperatureStepBlock).temperature || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (seconds, Optional)
                </label>
                <input
                  type="number"
                  value={(formData as TemperatureStepBlock).duration || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration:
                        e.target.value === ""
                          ? undefined
                          : parseInt(e.target.value) || undefined,
                    })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {block.type === "reagent" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chemical Name
                </label>
                <input
                  type="text"
                  value={(formData as ReagentStepBlock).chemicalName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, chemicalName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sodium Chloride"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={(formData as ReagentStepBlock).quantity || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={(formData as ReagentStepBlock).unit || "ml"}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="mol">mol</option>
                    <option value="mg">mg</option>
                    <option value="μl">μl</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {block.type === "equipment" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipment Name
                </label>
                <input
                  type="text"
                  value={(formData as EquipmentStepBlock).equipmentName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, equipmentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Centrifuge"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={(formData as EquipmentStepBlock).notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Additional notes about the equipment..."
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
