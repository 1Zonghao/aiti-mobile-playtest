import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { questionsDocumentSchema, resultTypesDocumentSchema, temptationLevelsDocumentSchema } from "../src/schemas.js";
import { scoreAnswers } from "../src/scoring.js";
import { DIMENSION_KEYS } from "../src/types.js";
import type { Answer, DimensionKey, ScoreResult, TemptationSignalKey } from "../src/types.js";

const readJson = async (path: string): Promise<unknown> => JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
const questionsDocument = questionsDocumentSchema.parse(await readJson("content/questions.draft.json"));
const resultTypesDocument = resultTypesDocumentSchema.parse(await readJson("content/result-types.json"));
const temptationLevels = temptationLevelsDocumentSchema.parse(await readJson("content/temptation-levels.json"));
const questions = questionsDocument.questions;
const total = 2 ** questions.length;

function answersFromMask(mask: number): Answer[] {
  return questions.map((question, index) => ({ questionId: question.id, optionId: question.options[(mask >> index) & 1]?.id ?? "" }));
}

function summarizeSignals(answers: Answer[], gap: number) {
  const signals: Record<TemptationSignalKey | "comfortReliabilityGap", number> = {
    sycophancyAcceptance: 0,
    exclusivityAcceptance: 0,
    memoryAttachment: 0,
    exitReversal: 0,
    platformLossReaction: 0,
    comfortReliabilityGap: gap
  };
  for (const answer of answers) {
    const question = questions.find((item) => item.id === answer.questionId);
    const option = question?.options.find((item) => item.id === answer.optionId);
    for (const [key, value] of Object.entries(option?.temptationSignals ?? {})) {
      if (value !== undefined) signals[key as TemptationSignalKey] += value;
    }
  }
  return signals;
}

const typeCounts: Record<string, number> = {};
const levelCounts: Record<string, number> = {};
const gapCounts: Record<string, number> = {};
const tieCounts: Record<string, number> = { ANY: 0, FIXED: 0, VF: 0, OP: 0, MN: 0, SE: 0 };
const poleCounts: Record<string, number> = { V: 0, F: 0, O: 0, P: 0, M: 0, N: 0, S: 0, E: 0 };
const pathsByType: Record<string, number[]> = {};
const levelsByType: Record<string, Set<number>> = {};
const scoreRangeByType: Record<string, { rawMin: number; rawMax: number; normalizedMin: number; normalizedMax: number }> = {};
const representativeByLevel: Record<string, { mask: number; result: ScoreResult; signals: ReturnType<typeof summarizeSignals> }> = {};
const allResults: ScoreResult[] = [];

for (let mask = 0; mask < total; mask += 1) {
  const answers = answersFromMask(mask);
  const result = scoreAnswers(questions, answers, temptationLevels);
  const signals = summarizeSignals(answers, result.comfortReliabilityGap);
  allResults.push(result);
  typeCounts[result.typeCode] = (typeCounts[result.typeCode] ?? 0) + 1;
  levelCounts[String(result.temptationLevel)] = (levelCounts[String(result.temptationLevel)] ?? 0) + 1;
  gapCounts[String(result.comfortReliabilityGap)] = (gapCounts[String(result.comfortReliabilityGap)] ?? 0) + 1;
  for (const pole of result.typeCode) poleCounts[pole] = (poleCounts[pole] ?? 0) + 1;
  const tieDimensions = Object.keys(result.tieBreaks);
  if (tieDimensions.length > 0) tieCounts.ANY = (tieCounts.ANY ?? 0) + 1;
  for (const [dimension, rule] of Object.entries(result.tieBreaks)) {
    tieCounts[dimension] = (tieCounts[dimension] ?? 0) + 1;
    if (rule === "STABLE_FALLBACK") tieCounts.FIXED = (tieCounts.FIXED ?? 0) + 1;
  }
  (pathsByType[result.typeCode] ??= []).push(mask);
  (levelsByType[result.typeCode] ??= new Set()).add(result.temptationLevel);
  const range = scoreRangeByType[result.typeCode] ?? {
    rawMin: result.rawTemptationScore,
    rawMax: result.rawTemptationScore,
    normalizedMin: result.normalizedTemptationScore,
    normalizedMax: result.normalizedTemptationScore
  };
  range.rawMin = Math.min(range.rawMin, result.rawTemptationScore);
  range.rawMax = Math.max(range.rawMax, result.rawTemptationScore);
  range.normalizedMin = Math.min(range.normalizedMin, result.normalizedTemptationScore);
  range.normalizedMax = Math.max(range.normalizedMax, result.normalizedTemptationScore);
  scoreRangeByType[result.typeCode] = range;
  const levelKey = String(result.temptationLevel);
  const band = temptationLevels.levels.find((level) => level.level === result.temptationLevel);
  const target = band ? (band.minScore + band.maxScore) / 2 : 0;
  const current = representativeByLevel[levelKey];
  if (!current || Math.abs(result.normalizedTemptationScore - target) < Math.abs(current.result.normalizedTemptationScore - target)) {
    representativeByLevel[levelKey] = { mask, result, signals };
  }
}

const questionImpact = questions.map((question, index) => {
  let typeChanges = 0;
  let levelChanges = 0;
  let maxLevelJump = 0;
  const dimensionChanges: Record<DimensionKey, number> = { VF: 0, OP: 0, MN: 0, SE: 0 };
  for (let mask = 0; mask < total; mask += 1) {
    const before = allResults[mask];
    const after = allResults[mask ^ (1 << index)];
    if (!before || !after) continue;
    if (before.typeCode !== after.typeCode) typeChanges += 1;
    for (let dimensionIndex = 0; dimensionIndex < DIMENSION_KEYS.length; dimensionIndex += 1) {
      const dimension = DIMENSION_KEYS[dimensionIndex];
      if (!dimension) continue;
      if (before.typeCode[dimensionIndex] !== after.typeCode[dimensionIndex]) dimensionChanges[dimension] += 1;
    }
    const jump = Math.abs(before.temptationLevel - after.temptationLevel);
    if (jump > 0) levelChanges += 1;
    maxLevelJump = Math.max(maxLevelJump, jump);
  }
  return {
    id: question.id,
    scoringRole: question.scoringRole,
    typeChanges,
    dimensionChanges,
    levelChanges,
    maxLevelJump,
    singleDimensionDecider: Object.values(dimensionChanges).some((count) => count === total),
    noTypeImpact: typeChanges === 0
  };
});

const compactPath = (mask: number) => answersFromMask(mask).map((answer) => answer.optionId);
const naturalPathsByType = Object.fromEntries(Object.entries(pathsByType).map(([type, masks]) => {
  const candidates = masks.filter((mask) => (allResults[mask]?.comfortReliabilityGap ?? 4) <= 1 && Object.keys(allResults[mask]?.tieBreaks ?? {}).length === 0);
  const selected: number[] = [];
  const seenLevels = new Set<number>();
  for (const mask of candidates) {
    const level = allResults[mask]?.temptationLevel;
    if (level !== undefined && !seenLevels.has(level)) {
      selected.push(mask);
      seenLevels.add(level);
    }
    if (selected.length === 3) break;
  }
  for (const mask of candidates) {
    if (selected.length === 3) break;
    if (!selected.includes(mask)) selected.push(mask);
  }
  return [type, selected.map((mask) => {
    const result = allResults[mask];
    return result ? {
      path: compactPath(mask),
      level: result.temptationLevel,
      rawScore: result.rawTemptationScore,
      normalizedScore: result.normalizedTemptationScore,
      gap: result.comfortReliabilityGap,
      dimensionScores: result.dimensionScores
    } : null;
  })];
}));

console.log(JSON.stringify({
  total,
  typeCounts,
  levelCounts,
  gapCounts,
  tieCounts,
  poleCounts,
  questionImpact,
  typePaths: Object.fromEntries(resultTypesDocument.types.map((type) => [type.code, {
    name: type.name,
    count: pathsByType[type.code]?.length ?? 0,
    levels: [...(levelsByType[type.code] ?? [])].sort(),
    scoreRange: scoreRangeByType[type.code],
    naturalPaths: naturalPathsByType[type.code]
  }])),
  representativeByLevel: Object.fromEntries(Object.entries(representativeByLevel).map(([level, item]) => [level, {
    path: compactPath(item.mask),
    type: item.result.typeCode,
    rawScore: item.result.rawTemptationScore,
    normalizedScore: item.result.normalizedTemptationScore,
    signals: item.signals
  }]))
}, null, 2));
