import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { questionsDocumentSchema, temptationLevelsDocumentSchema } from "../src/schemas.js";
import { calculateTemptation, resolveDimension, scoreAnswers } from "../src/scoring.js";
import { DIMENSION_KEYS, TYPE_CODES } from "../src/types.js";
import type { Answer, DimensionScores, Question, ScoreResult, TemptationLevelsDocument, TemptationSignals, TypeCode } from "../src/types.js";

interface EnumeratedCase {
  mask: number;
  answers: Answer[];
  result: ScoreResult;
  highRiskChoices: number;
  protectiveChoices: number;
}

let questions: Question[];
let temptationLevels: TemptationLevelsDocument;
let cases: EnumeratedCase[];

function answersFromMask(mask: number): Answer[] {
  return questions.map((question, index) => ({ questionId: question.id, optionId: question.options[(mask >> index) & 1]?.id ?? "" }));
}

function answersForType(code: TypeCode): Answer[] {
  const targets = [code[0], code[1], code[2], code[3]];
  return questions.map((question) => {
    const dimensionIndex = question.dimension ? DIMENSION_KEYS.indexOf(question.dimension) : -1;
    const target = targets[dimensionIndex];
    const option = question.options.find((candidate) => candidate.dimensionEffects.some((effect) => effect.pole === target));
    if (!option) throw new Error(`题目 ${question.id} 无法选择 ${target}。`);
    return { questionId: question.id, optionId: option.id };
  });
}

beforeAll(async () => {
  const questionsRaw: unknown = JSON.parse(await readFile(resolve("content", "questions.draft.json"), "utf8"));
  const levelsRaw: unknown = JSON.parse(await readFile(resolve("content", "temptation-levels.json"), "utf8"));
  questions = questionsDocumentSchema.parse(questionsRaw).questions;
  temptationLevels = temptationLevelsDocumentSchema.parse(levelsRaw);
  cases = Array.from({ length: 2 ** questions.length }, (_, mask) => {
    const answers = answersFromMask(mask);
    let highRiskChoices = 0;
    for (const answer of answers) {
      const question = questions.find((item) => item.id === answer.questionId);
      const option = question?.options.find((item) => item.id === answer.optionId);
      if (Object.values(option?.temptationSignals ?? {}).some((value) => (value ?? 0) > 0)) highRiskChoices += 1;
    }
    return {
      mask,
      answers,
      result: scoreAnswers(questions, answers, temptationLevels),
      highRiskChoices,
      protectiveChoices: questions.length - highRiskChoices
    };
  });
});

const zeroScores: DimensionScores = { V: 0, F: 0, O: 0, P: 0, M: 0, N: 0, S: 0, E: 0 };
const zeroSignals = (): TemptationSignals => ({
  sycophancyAcceptance: 0,
  exclusivityAcceptance: 0,
  memoryAttachment: 0,
  exitReversal: 0,
  platformLossReaction: 0,
  comfortReliabilityGap: 0
});

describe("Phase 1.5B 四维评分结构", () => {
  it("16 种类型全部可达，且每型有多条无平局路径", () => {
    const reached = new Set(cases.map((item) => item.result.typeCode));
    expect(reached).toEqual(new Set(TYPE_CODES));
    for (const code of TYPE_CODES) {
      expect(cases.filter((item) => item.result.typeCode === code && Object.keys(item.result.tieBreaks).length === 0).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("相同答案始终得到相同完整结果", () => {
    const answers = answersForType("FPNE");
    expect(scoreAnswers(questions, answers, temptationLevels)).toEqual(scoreAnswers(questions, structuredClone(answers), temptationLevels));
  });

  it("平局率与固定回退率满足阈值", () => {
    const anyTie = cases.filter((item) => Object.keys(item.result.tieBreaks).length > 0).length / cases.length;
    const fixedFallback = cases.filter((item) => Object.values(item.result.tieBreaks).includes("STABLE_FALLBACK")).length / cases.length;
    expect(anyTie).toBeLessThan(0.15);
    expect(fixedFallback).toBeLessThan(0.05);
    for (const dimension of DIMENSION_KEYS) {
      const rate = cases.filter((item) => item.result.tieBreaks[dimension] !== undefined).length / cases.length;
      expect(rate).toBeLessThan(0.1);
    }
  });

  it("没有单题决定完整维度，每道维度题都有实际边际影响", () => {
    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      if (!question || question.scoringRole !== "DIMENSION") continue;
      let typeChanges = 0;
      let dimensionChanges = 0;
      const dimensionIndex = question.dimension ? DIMENSION_KEYS.indexOf(question.dimension) : -1;
      for (const item of cases) {
        const flipped = cases[item.mask ^ (1 << index)];
        if (!flipped) continue;
        if (item.result.typeCode !== flipped.result.typeCode) typeChanges += 1;
        if (dimensionIndex >= 0 && item.result.typeCode[dimensionIndex] !== flipped.result.typeCode[dimensionIndex]) dimensionChanges += 1;
      }
      expect(typeChanges, question.id).toBeGreaterThan(0);
      expect(dimensionChanges, question.id).toBeGreaterThan(0);
      expect(dimensionChanges, question.id).toBeLessThan(cases.length);
    }
  });

  it("纯哄感题若存在必须明确标记且不带维度效果", () => {
    for (const question of questions.filter((item) => item.scoringRole === "TEMPTATION_ONLY")) {
      expect(question.dimension).toBeNull();
      expect(question.terminalFor).toBeNull();
      expect(question.options.every((option) => option.dimensionEffects.length === 0)).toBe(true);
    }
  });

  it("配对题显式输出 comfortChoice、reliabilityChoice 与 isGap", () => {
    const result = cases[0]?.result;
    expect(result?.pairedChoices).toHaveLength(3);
    for (const pair of result?.pairedChoices ?? []) {
      expect(pair.comfortChoice).toBeTruthy();
      expect(pair.reliabilityChoice).toBeTruthy();
      expect(typeof pair.isGap).toBe("boolean");
    }
  });

  it("稳定回退规则仍确定，但当前完整题库无需使用", () => {
    expect(resolveDimension("VF", zeroScores, "F")).toEqual({ pole: "F", rule: "TERMINAL_QUESTION" });
    expect(resolveDimension("OP", zeroScores, null)).toEqual({ pole: "O", rule: "STABLE_FALLBACK" });
    expect(cases.every((item) => Object.keys(item.result.tieBreaks).length === 0)).toBe(true);
  });
});

describe("Phase 1.5B 哄感等级", () => {
  it("6 个等级全部可达", () => {
    expect(new Set(cases.map((item) => item.result.temptationLevel))).toEqual(new Set([0, 1, 2, 3, 4, 5]));
  });

  it("同一人格至少可出现两个不同等级", () => {
    for (const code of TYPE_CODES) {
      const levels = new Set(cases.filter((item) => item.result.typeCode === code).map((item) => item.result.temptationLevel));
      expect(levels.size, code).toBeGreaterThanOrEqual(2);
    }
  });

  it("每种人格都有三条自然路径并覆盖至少两个等级", () => {
    for (const code of TYPE_CODES) {
      const natural = cases.filter((item) => item.result.typeCode === code && item.result.comfortReliabilityGap <= 1 && Object.keys(item.result.tieBreaks).length === 0);
      expect(natural.length, code).toBeGreaterThanOrEqual(3);
      expect(new Set(natural.map((item) => item.result.temptationLevel)).size, code).toBeGreaterThanOrEqual(2);
    }
  });

  it("Lv.5 需要多个高风险选择共同累积", () => {
    const levelFive = cases.filter((item) => item.result.temptationLevel === 5);
    expect(levelFive.length).toBeGreaterThan(0);
    expect(Math.min(...levelFive.map((item) => item.highRiskChoices))).toBeGreaterThanOrEqual(5);
  });

  it("Lv.0 需要多个低风险或退出保护选择", () => {
    const levelZero = cases.filter((item) => item.result.temptationLevel === 0);
    expect(levelZero.length).toBeGreaterThan(0);
    expect(Math.min(...levelZero.map((item) => item.protectiveChoices))).toBeGreaterThanOrEqual(10);
  });

  it("单题不会跨越两个以上等级", () => {
    for (let index = 0; index < questions.length; index += 1) {
      const maxJump = Math.max(...cases.map((item) => {
        const flipped = cases[item.mask ^ (1 << index)];
        return flipped ? Math.abs(item.result.temptationLevel - flipped.result.temptationLevel) : 0;
      }));
      expect(maxJump, questions[index]?.id).toBeLessThanOrEqual(1);
    }
  });

  it("原始分 0—26 映射为归一化 0—100", () => {
    expect(calculateTemptation(zeroSignals(), temptationLevels)).toEqual({ rawScore: 0, normalizedScore: 0, level: 0 });
    const maximum: TemptationSignals = {
      sycophancyAcceptance: 3,
      exclusivityAcceptance: 3,
      memoryAttachment: 3,
      exitReversal: 2,
      platformLossReaction: 2,
      comfortReliabilityGap: 0
    };
    expect(calculateTemptation(maximum, temptationLevels)).toEqual({ rawScore: 26, normalizedScore: 100, level: 5 });
  });
});
