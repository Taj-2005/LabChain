"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import type { ProtocolBlock } from "@/lib/types/protocol";
import ProtocolBlockRenderer from "./blocks";

interface FlowCanvasProps {
  blocks: ProtocolBlock[];
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onBlockReorder: (blocks: ProtocolBlock[]) => void;
  onBlockDelete: (blockId: string) => void;
}

interface SortableBlockItemProps {
  block: ProtocolBlock;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableBlockItem({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProtocolBlockRenderer
        block={block}
        index={index}
        isSelected={isSelected}
        onClick={onSelect}
        onDelete={onDelete}
      />
    </div>
  );
}

export default function FlowCanvas({
  blocks,
  selectedBlockId,
  onBlockSelect,
  onBlockReorder,
  onBlockDelete,
}: FlowCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      // Update order numbers
      const reorderedBlocks = newBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));
      onBlockReorder(reorderedBlocks);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Protocol Steps ({blocks.length})
          </h3>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {blocks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <p className="text-lg mb-2">No protocol blocks yet</p>
                    <p className="text-sm">
                      Add blocks using the buttons above to get started
                    </p>
                  </motion.div>
                ) : (
                  blocks.map((block, index) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      index={index}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => onBlockSelect(block.id)}
                      onDelete={() => onBlockDelete(block.id)}
                    />
                  ))
                )}
              </div>
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
