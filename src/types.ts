export const DIMENSION_KEYS = ["VF", "OP", "MN", "SE"] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const TYPE_CODES = [
  "VOMS", "VOME", "VONS", "VONE",
  "VPMS", "VPME", "VPNS", "VPNE",
  "FOMS", "FOME", "FONS", "FONE",
  "FPMS", "FPME", "FPNS", "FPNE"
] as const;
export type TypeCode = (typeof TYPE_CODES)[number];
export type Pole = "V" | "F" | "O" | "P" | "M" | "N" | "S" | "E";
export type ContentStatus = "CONFIRMED" | "MISSING" | "DRAFT_REQUIRES_HUMAN_REVIEW";
export type Versioned<T> = T & { schemaVersion: string; contentVersion: string };

export interface DimensionDefinition {
  key: DimensionKey;
  position: 1 | 2 | 3 | 4;
  label: string;
  poles: [{ code: Pole; name: string; colloquialName: string; meaning: string }, { code: Pole; name: string; colloquialName: string; meaning: string }];
  interactionRationale: string;
}

export interface Palette {
  hex: string[] | null;
  description: string;
  status: ContentStatus;
}

export interface ResultType {
  code: TypeCode;
  name: string;
  definition: string;
  resultTitle: string | null;
  fatalLine: string;
  platformFear: string;
  roast: string;
  safetyNote: string | null;
  shareText: string | null;
  dimensions: { VF: "V" | "F"; OP: "O" | "P"; MN: "M" | "N"; SE: "S" | "E" };
  palette: Palette;
  visualKeywords: string[];
  imagePath: string | null;
  plainDescription: string | null;
  featured: boolean;
  priority: number;
  fieldStatus: { resultTitle: ContentStatus; safetyNote: ContentStatus; shareText: ContentStatus; imagePath: ContentStatus };
}

export interface QuestionOption {
  id: string;
  text: string;
  dimensionEffects: Array<{ dimension: DimensionKey; pole: Pole; points: 1 | 2 }>;
  temptationEffects: Partial<Record<TemptationSignalKey, number | undefined>>;
}

export interface Question {
  id: string;
  responseFormat: "THREE_CHOICE" | "FOUR_CHOICE" | "COMFORT_RELIABILITY_PAIR";
  prompt: string;
  pairPrompts: { comfort: string; reliability: string } | null;
  primaryDimension: DimensionKey;
  platformUpdateFinale: boolean;
  options: QuestionOption[];
  researchConcept: string;
  status: "DRAFT_REQUIRES_HUMAN_REVIEW";
  rationale: string;
}

export interface Answer {
  questionId: string;
  optionId: string;
  responseKind: "PRIMARY" | "COMFORT" | "RELIABILITY";
}

export interface AnswerTraceItem {
  questionId: string;
  optionId: string;
  responseKind: Answer["responseKind"];
  dimensionEffects: Array<{ dimension: DimensionKey; pole: Pole; points: number }>;
}

export type DimensionScores = Record<Pole, number>;
export type DimensionMargins = Record<DimensionKey, number>;
export type DimensionConfidence = Record<DimensionKey, number>;
export type TemptationSignalKey = "sycophancyAcceptance" | "exclusivityAcceptance" | "memoryAttachment" | "exitReversal" | "platformLossReaction";
export interface TemptationSignals extends Record<TemptationSignalKey, number> {
  comfortReliabilityGap: number;
}
export type TemptationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface TemptationLevelDefinition {
  level: TemptationLevel;
  code: `LV${TemptationLevel}`;
  name: string;
  minScore: number;
  maxScore: number;
  shortDescription: string;
  tagline: string;
  resultCopy: string;
  shareCopy: string;
  warningCopy: string;
}

export interface TemptationLevelsDocument {
  schemaVersion: string;
  contentVersion: string;
  status: "DRAFT_REQUIRES_HUMAN_REVIEW";
  scoring: {
    rawMin: 0;
    rawMax: number;
    normalizedMin: 0;
    normalizedMax: 100;
    normalization: string;
    weights: Record<keyof TemptationSignals, number>;
  };
  levels: TemptationLevelDefinition[];
}

export interface PairedChoice {
  pairId: string;
  comfortChoice: string;
  reliabilityChoice: string;
  isGap: boolean;
}

export interface ScoreResult {
  dimensionScores: DimensionScores;
  dimensionMargins: DimensionMargins;
  dimensionConfidence: DimensionConfidence;
  primaryType: TypeCode;
  shadowType: TypeCode;
  /** Backwards-compatible alias of primaryType for existing result views and exports. */
  typeCode: TypeCode;
  rawTemptationScore: number;
  normalizedTemptationScore: number;
  temptationLevel: TemptationLevel;
  comfortReliabilityGap: number;
  pairedChoices: PairedChoice[];
  answerTrace: AnswerTraceItem[];
  tieBreaks: Partial<Record<DimensionKey, "TERMINAL_QUESTION" | "STABLE_FALLBACK">>;
}
