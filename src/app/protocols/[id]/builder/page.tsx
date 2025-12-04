"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import FlowCanvas from "@/components/protocol-builder/FlowCanvas";
import InspectorPanel from "@/components/protocol-builder/InspectorPanel";
import AISuggestionPanel from "@/components/protocol-builder/AISuggestionPanel";
import type {
  ProtocolBlock,
  AISuggestion,
  AIStandardizationResponse,
} from "@/lib/types/protocol";
import { useToast } from "@/components/Toast";

export default function ProtocolBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const { showToast } = useToast();
  const experimentId = (params?.id as string) || "";

  const [blocks, setBlocks] = useState<ProtocolBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  // Load protocol on mount
  useEffect(() => {
    if (token && experimentId) {
      loadProtocol();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId, token]);

  const loadProtocol = async () => {
    try {
      const response = await fetch(`/api/experiments/${experimentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const experiment = data.experiment;

        if (experiment?.protocol?.steps) {
          // Convert old format to new format if needed
          const convertedBlocks = convertToNewFormat(experiment.protocol.steps);
          setBlocks(convertedBlocks);
          setCurrentVersion(experiment.version || 1);
          lastSavedRef.current = JSON.stringify(convertedBlocks);
        }
      }
    } catch {
      showToast("Failed to load protocol", "error");
    }
  };

  // Convert old protocol format to new block format
  const convertToNewFormat = (steps: unknown[]): ProtocolBlock[] => {
    return steps.map((step, index) => {
      // Type guard for step object
      if (typeof step === "object" && step !== null && "type" in step) {
        const stepObj = step as {
          type: string;
          id?: string;
          content?: string;
          order?: number;
        };

        // If already in new format, return as is
        if (
          stepObj.type === "text" ||
          stepObj.type === "timer" ||
          stepObj.type === "temperature" ||
          stepObj.type === "reagent" ||
          stepObj.type === "equipment"
        ) {
          return step as ProtocolBlock;
        }

        // Convert old format (step/note/measurement) to new format
        return {
          id: stepObj.id || `block-${Date.now()}-${index}`,
          type: "text",
          content: stepObj.content || "",
          order: stepObj.order ?? index,
        };
      }

      // Fallback for invalid step format
      return {
        id: `block-${Date.now()}-${index}`,
        type: "text",
        content: "",
        order: index,
      };
    });
  };

  // Debounced autosave
  const debouncedSave = useCallback(
    (blocksToSave: ProtocolBlock[]) => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        if (!token) return;

        const blocksString = JSON.stringify(blocksToSave);
        if (blocksString === lastSavedRef.current) {
          return; // No changes
        }

        setIsSaving(true);
        try {
          const response = await fetch(`/api/experiments/${experimentId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              protocol: {
                steps: blocksToSave,
              },
              version: currentVersion,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            lastSavedRef.current = blocksString;
            if (data.experiment?.version) {
              setCurrentVersion(data.experiment.version);
            }
            showToast("Protocol saved", "success", 2000);
          } else {
            const errorData = await response.json();
            showToast(errorData.error || "Failed to save", "error");
          }
        } catch {
          showToast("Failed to save protocol", "error");
        } finally {
          setIsSaving(false);
        }
      }, 700);
    },
    [experimentId, currentVersion, token, showToast]
  );

  // Update blocks and trigger autosave
  const updateBlocks = useCallback(
    (newBlocks: ProtocolBlock[]) => {
      setBlocks(newBlocks);
      debouncedSave(newBlocks);
    },
    [debouncedSave]
  );

  // Add new block
  const addBlock = (type: ProtocolBlock["type"]) => {
    let newBlock: ProtocolBlock;

    const base = {
      id: `block-${Date.now()}-${Math.random()}`,
      order: blocks.length,
    };

    switch (type) {
      case "text":
        newBlock = {
          ...base,
          type: "text",
          content: "",
        };
        break;
      case "timer":
        newBlock = {
          ...base,
          type: "timer",
          duration: 60,
          label: "",
        };
        break;
      case "temperature":
        newBlock = {
          ...base,
          type: "temperature",
          temperature: 25,
          label: "",
        };
        break;
      case "reagent":
        newBlock = {
          ...base,
          type: "reagent",
          chemicalName: "",
          quantity: 0,
          unit: "ml",
        };
        break;
      case "equipment":
        newBlock = {
          ...base,
          type: "equipment",
          equipmentName: "",
          notes: "",
        };
        break;
      default:
        newBlock = {
          ...base,
          type: "text",
          content: "",
        };
    }

    updateBlocks([...blocks, newBlock]);
  };

  // Update block
  const updateBlock = (updatedBlock: ProtocolBlock) => {
    const newBlocks = blocks.map((b) =>
      b.id === updatedBlock.id ? updatedBlock : b
    );
    updateBlocks(newBlocks);
    setIsInspectorOpen(false);
    setSelectedBlockId(null);
  };

  // Delete block
  const deleteBlock = (blockId: string) => {
    const newBlocks = blocks
      .filter((b) => b.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    updateBlocks(newBlocks);
    if (selectedBlockId === blockId) {
      setIsInspectorOpen(false);
      setSelectedBlockId(null);
    }
  };

  // Reorder blocks
  const reorderBlocks = (reorderedBlocks: ProtocolBlock[]) => {
    updateBlocks(reorderedBlocks);
  };

  // Handle block selection
  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlockId(blockId);
    setIsInspectorOpen(blockId !== null);
  };

  // AI Standardization
  const fetchAISuggestions = async () => {
    if (!token) return;

    setIsLoadingSuggestions(true);
    setIsAIPanelOpen(true);

    try {
      const response = await fetch("/api/ai/standardize-protocol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          blocks,
          experimentId,
        }),
      });

      if (response.ok) {
        const data: AIStandardizationResponse = await response.json();
        setAiSuggestions(data.suggestions);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to get AI suggestions", "error");
      }
    } catch {
      showToast("Failed to get AI suggestions", "error");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Accept AI suggestion
  const acceptSuggestion = (suggestion: AISuggestion) => {
    const block = blocks.find((b) => b.id === suggestion.blockId);
    if (!block) return;

    const updatedBlock = {
      ...block,
      [suggestion.field]: suggestion.suggestedValue,
    };
    updateBlock(updatedBlock as ProtocolBlock);

    // Remove accepted suggestion
    setAiSuggestions((prev) =>
      prev.filter(
        (s) =>
          !(s.blockId === suggestion.blockId && s.field === suggestion.field)
      )
    );
  };

  // Accept all suggestions
  const acceptAllSuggestions = () => {
    const updatedBlocks = [...blocks];
    aiSuggestions.forEach((suggestion) => {
      const blockIndex = updatedBlocks.findIndex(
        (b) => b.id === suggestion.blockId
      );
      if (blockIndex !== -1) {
        updatedBlocks[blockIndex] = {
          ...updatedBlocks[blockIndex],
          [suggestion.field]: suggestion.suggestedValue,
        } as ProtocolBlock;
      }
    });
    updateBlocks(updatedBlocks);
    setAiSuggestions([]);
    setIsAIPanelOpen(false);
  };

  // Reject suggestion
  const rejectSuggestion = (suggestionId: string) => {
    setAiSuggestions((prev) =>
      prev.filter(
        (_, index) =>
          `${prev[index].blockId}-${prev[index].field}-${index}` !==
          suggestionId
      )
    );
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Protocol Builder
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Version {currentVersion}
            </span>
            {isSaving && (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Saving...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAISuggestions}
              disabled={isLoadingSuggestions || blocks.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {isLoadingSuggestions
                ? "Loading..."
                : "Suggest Improvements (AI)"}
            </button>
          </div>
        </div>

        {/* Block Type Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => addBlock("text")}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Text Step
          </button>
          <button
            onClick={() => addBlock("timer")}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            + Timer
          </button>
          <button
            onClick={() => addBlock("temperature")}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            + Temperature
          </button>
          <button
            onClick={() => addBlock("reagent")}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + Reagent
          </button>
          <button
            onClick={() => addBlock("equipment")}
            className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            + Equipment
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        <FlowCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onBlockSelect={handleBlockSelect}
          onBlockReorder={reorderBlocks}
          onBlockDelete={deleteBlock}
        />

        {isInspectorOpen && selectedBlock && (
          <InspectorPanel
            block={selectedBlock}
            onUpdate={updateBlock}
            onClose={() => {
              setIsInspectorOpen(false);
              setSelectedBlockId(null);
            }}
          />
        )}
      </div>

      {/* AI Suggestion Panel */}
      <AISuggestionPanel
        suggestions={aiSuggestions}
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        onAccept={acceptSuggestion}
        onAcceptAll={acceptAllSuggestions}
        onReject={rejectSuggestion}
      />
    </div>
  );
}
