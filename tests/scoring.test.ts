import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { questionsDocumentSchema, temptationLevelsDocumentSchema } from "../src/schemas.js";
import { calculateShadowType, calculateTemptation, DIMENSION_POLES, resolveDimension, scoreAnswers } from "../src/scoring.js";
import { DIMENSION_KEYS, TYPE_CODES } from "../src/types.js";
import type { Answer, DimensionMargins, DimensionScores, Question, TemptationLevelsDocument, TemptationSignals, TypeCode } from "../src/types.js";

let questions: Question[];
let temptationLevels: TemptationLevelsDocument;

function answersForType(code: TypeCode): Answer[] {
  const answers: Answer[] = [];
  for (const question of questions) {
    const dimensionIndex = DIMENSION_KEYS.indexOf(question.primaryDimension);
    const target = code[dimensionIndex];
    const option = question.options.find((candidate) => candidate.dimensionEffects.some((effect) => effect.dimension === question.primaryDimension && effect.pole === target));
    if (!option) throw new Error(`${question.id} 无法选择 ${target}。`);
    if (question.responseFormat === "COMFORT_RELIABILITY_PAIR") answers.push({ questionId: question.id, optionId: option.id, responseKind: "COMFORT" }, { questionId: question.id, optionId: option.id, responseKind: "RELIABILITY" });
    else answers.push({ questionId: question.id, optionId: option.id, responseKind: "PRIMARY" });
  }
  return answers;
}

function seededCases(count: number): Answer[][] {
  let seed = 0x2_2_2026;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  return Array.from({ length: count }, () => {
    const answers: Answer[] = [];
    for (const question of questions) {
      const choose = () => question.options[Math.floor(random() * question.options.length)]!;
      if (question.responseFormat === "COMFORT_RELIABILITY_PAIR") answers.push({ questionId: question.id, optionId: choose().id, responseKind: "COMFORT" }, { questionId: question.id, optionId: choose().id, responseKind: "RELIABILITY" });
      else answers.push({ questionId: question.id, optionId: choose().id, responseKind: "PRIMARY" });
    }
    return answers;
  });
}

beforeAll(async () => {
  questions = questionsDocumentSchema.parse(JSON.parse(await readFile(resolve("content/questions.draft.json"), "utf8"))).questions;
  temptationLevels = temptationLevelsDocumentSchema.parse(JSON.parse(await readFile(resolve("content/temptation-levels.json"), "utf8")));
});

const zeroScores: DimensionScores = { V: 0, F: 0, O: 0, P: 0, M: 0, N: 0, S: 0, E: 0 };
const zeroSignals = (): TemptationSignals => ({ sycophancyAcceptance: 0, exclusivityAcceptance: 0, memoryAttachment: 0, exitReversal: 0, platformLossReaction: 0, comfortReliabilityGap: 0 });

describe("Phase 2.2 多选评分", () => {
  it("包含6道三选、4道四选和2组舒服—可靠双选", () => {
    expect(questions.filter((item) => item.responseFormat === "THREE_CHOICE")).toHaveLength(6);
    expect(questions.filter((item) => item.responseFormat === "FOUR_CHOICE")).toHaveLength(4);
    expect(questions.filter((item) => item.responseFormat === "COMFORT_RELIABILITY_PAIR")).toHaveLength(2);
  });

  it("16型全部存在自然的确定性到达路径", () => {
    for (const code of TYPE_CODES) expect(scoreAnswers(questions, answersForType(code), temptationLevels).primaryType).toBe(code);
  });

  it("相同答案始终产生相同主类型、影子类型和连续结果", () => {
    const answers = answersForType("FPNE");
    expect(scoreAnswers(questions, answers, temptationLevels)).toEqual(scoreAnswers(questions, structuredClone(answers), temptationLevels));
  });

  it("双选分别记录comfort/reliability并正确识别gap", () => {
    const answers = answersForType("VOMS");
    const pair = questions.find((item) => item.id === "q01_response_pair")!;
    const opposite = pair.options.find((option) => option.dimensionEffects.some((effect) => effect.dimension === "VF" && effect.pole === "F"))!;
    const reliability = answers.find((answer) => answer.questionId === pair.id && answer.responseKind === "RELIABILITY")!;
    reliability.optionId = opposite.id;
    const result = scoreAnswers(questions, answers, temptationLevels);
    expect(result.pairedChoices.find((item) => item.pairId === pair.id)).toMatchObject({ comfortChoice: "q01_a", reliabilityChoice: opposite.id, isGap: true });
  });

  it("margin为两极分差，confidence为绝对分差占该维总分", () => {
    const result = scoreAnswers(questions, answersForType("VOMS"), temptationLevels);
    for (const dimension of DIMENSION_KEYS) {
      const [first, second] = DIMENSION_POLES[dimension];
      const expectedMargin = result.dimensionScores[first] - result.dimensionScores[second];
      const total = result.dimensionScores[first] + result.dimensionScores[second];
      expect(result.dimensionMargins[dimension]).toBe(expectedMargin);
      expect(result.dimensionConfidence[dimension]).toBe(Math.round(Math.abs(expectedMargin) / total * 1000) / 1000);
    }
  });

  it("shadowType只翻转绝对margin最小的一维，平手按固定维度顺序", () => {
    const margins: DimensionMargins = { VF: 5, OP: -1, MN: 3, SE: 4 };
    expect(calculateShadowType("VPME", margins)).toBe("VOME");
    expect(calculateShadowType("VOMS", { VF: 1, OP: 1, MN: 2, SE: 3 })).toBe("FOMS");
  });

  it("每题主维度贡献不超过2分，且同维其他题合计至少4分", () => {
    for (const question of questions) {
      const ownMax = question.responseFormat === "COMFORT_RELIABILITY_PAIR" ? 2 : 2;
      const otherCapacity = questions.filter((item) => item.id !== question.id && item.primaryDimension === question.primaryDimension).length * 2;
      expect(ownMax, question.id).toBeLessThan(otherCapacity);
    }
  });

  it("固定种子分层模拟覆盖16型、6等级，且同型可落入多个等级", () => {
    const results = seededCases(30_000).map((answers) => scoreAnswers(questions, answers, temptationLevels));
    expect(new Set(results.map((result) => result.primaryType))).toEqual(new Set(TYPE_CODES));
    expect(new Set(results.map((result) => result.temptationLevel))).toEqual(new Set([0,1,2,3,4,5]));
    for (const code of TYPE_CODES) expect(new Set(results.filter((result) => result.primaryType === code).map((result) => result.temptationLevel)).size).toBeGreaterThanOrEqual(2);
  });

  it("无随机分型、动态阈值或人格配额逻辑", async () => {
    const source = await readFile(resolve("src/scoring.ts"), "utf8");
    expect(source).not.toMatch(/Math\.random|crypto\.random|quota|typeCounts|recentResults|dynamicThreshold/i);
  });

  it("稳定回退与哄感归一化仍然确定", () => {
    expect(resolveDimension("VF", zeroScores)).toEqual({ pole: "V", rule: "STABLE_FALLBACK" });
    expect(calculateTemptation(zeroSignals(), temptationLevels)).toEqual({ rawScore: 0, normalizedScore: 0, level: 0 });
  });

  it("任一题的哄感最大变化不足以跨越两个等级区间", () => {
    const narrowestBand = Math.min(...temptationLevels.levels.map((level) => level.maxScore - level.minScore + 1));
    for (const question of questions) {
      const sums = question.options.map((option) => Object.values(option.temptationEffects).reduce<number>((sum, value) => sum + (value ?? 0), 0));
      const maxRawDelta = (Math.max(...sums) - Math.min(...sums)) * (question.responseFormat === "COMFORT_RELIABILITY_PAIR" ? 2 : 1);
      const normalizedDelta = Math.ceil(maxRawDelta / temptationLevels.scoring.rawMax * 100);
      expect(normalizedDelta, question.id).toBeLessThan(narrowestBand);
    }
  });
});
