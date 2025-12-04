"use client";

import type { ProtocolBlock } from "@/lib/types/protocol";
import TextStepBlock from "./TextStepBlock";
import TimerStepBlock from "./TimerStepBlock";
import TemperatureStepBlock from "./TemperatureStepBlock";
import ReagentStepBlock from "./ReagentStepBlock";
import EquipmentStepBlock from "./EquipmentStepBlock";

interface ProtocolBlockRendererProps {
  block: ProtocolBlock;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function ProtocolBlockRenderer({
  block,
  index,
  isSelected,
  onClick,
  onDelete,
}: ProtocolBlockRendererProps) {
  switch (block.type) {
    case "text":
      return (
        <TextStepBlock
          block={block}
          index={index}
          isSelected={isSelected}
          onClick={onClick}
          onDelete={onDelete}
        />
      );
    case "timer":
      return (
        <TimerStepBlock
          block={block}
          index={index}
          isSelected={isSelected}
          onClick={onClick}
          onDelete={onDelete}
        />
      );
    case "temperature":
      return (
        <TemperatureStepBlock
          block={block}
          index={index}
          isSelected={isSelected}
          onClick={onClick}
          onDelete={onDelete}
        />
      );
    case "reagent":
      return (
        <ReagentStepBlock
          block={block}
          index={index}
          isSelected={isSelected}
          onClick={onClick}
          onDelete={onDelete}
        />
      );
    case "equipment":
      return (
        <EquipmentStepBlock
          block={block}
          index={index}
          isSelected={isSelected}
          onClick={onClick}
          onDelete={onDelete}
        />
      );
    default:
      return null;
  }
}
