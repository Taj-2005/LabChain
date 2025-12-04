"use client";

import { useState } from "react";

interface ProtocolBlock {
  id: string;
  type: "step" | "note" | "measurement";
  content: string;
  order: number;
}

interface ProtocolBuilderProps {
  protocol: ProtocolBlock[];
  onChange: (blocks: ProtocolBlock[]) => void;
}

export default function ProtocolBuilder({
  protocol,
  onChange,
}: ProtocolBuilderProps) {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const addBlock = (type: ProtocolBlock["type"]) => {
    const newBlock: ProtocolBlock = {
      id: Date.now().toString(),
      type,
      content: "",
      order: protocol.length,
    };
    onChange([...protocol, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    onChange(
      protocol.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  const deleteBlock = (id: string) => {
    onChange(protocol.filter((block) => block.id !== id));
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newProtocol = [...protocol];
    const [moved] = newProtocol.splice(fromIndex, 1);
    newProtocol.splice(toIndex, 0, moved);
    newProtocol.forEach((block, index) => {
      block.order = index;
    });
    onChange(newProtocol);
  };

  const handleDragStart = (id: string) => {
    setDraggedBlock(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedBlock) return;

    const fromIndex = protocol.findIndex((b) => b.id === draggedBlock);
    const toIndex = protocol.findIndex((b) => b.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      moveBlock(fromIndex, toIndex);
    }

    setDraggedBlock(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => addBlock("step")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          + Step
        </button>
        <button
          onClick={() => addBlock("note")}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          + Note
        </button>
        <button
          onClick={() => addBlock("measurement")}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
        >
          + Measurement
        </button>
      </div>

      <div className="space-y-2">
        {protocol.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(block.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(block.id)}
            className="flex items-start space-x-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:shadow-md transition-shadow"
          >
            <div className="flex-shrink-0 pt-2 text-gray-400 text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    block.type === "step"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : block.type === "note"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  }`}
                >
                  {block.type}
                </span>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder={`Enter ${block.type} content...`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      {protocol.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No protocol blocks yet. Add your first block above.
        </div>
      )}
    </div>
  );
}
