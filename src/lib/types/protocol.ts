/**
 * Extended protocol block types for advanced visual builder
 */

export type ProtocolBlockType =
  | "text"
  | "timer"
  | "temperature"
  | "reagent"
  | "equipment";

export interface BaseProtocolBlock {
  id: string;
  type: ProtocolBlockType;
  order: number;
}

export interface TextStepBlock extends BaseProtocolBlock {
  type: "text";
  content: string;
}

export interface TimerStepBlock extends BaseProtocolBlock {
  type: "timer";
  duration: number; // in seconds
  label?: string;
}

export interface TemperatureStepBlock extends BaseProtocolBlock {
  type: "temperature";
  temperature: number; // in Celsius
  duration?: number; // in seconds
  label?: string;
}

export interface ReagentStepBlock extends BaseProtocolBlock {
  type: "reagent";
  chemicalName: string;
  quantity: number;
  unit: string; // e.g., "ml", "g", "mol"
}

export interface EquipmentStepBlock extends BaseProtocolBlock {
  type: "equipment";
  equipmentName: string;
  notes?: string;
}

export type ProtocolBlock =
  | TextStepBlock
  | TimerStepBlock
  | TemperatureStepBlock
  | ReagentStepBlock
  | EquipmentStepBlock;

export interface AISuggestion {
  blockId: string;
  field: string;
  currentValue: string | number | undefined;
  suggestedValue: string | number;
  reason: string;
}

export interface AIStandardizationResponse {
  suggestions: AISuggestion[];
  confidence: number;
}
