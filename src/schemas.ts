import { z } from "zod";
import { DIMENSION_KEYS, TYPE_CODES } from "./types";

const versionFields = {
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  contentVersion: z.union([z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/), z.literal("aiti-content-v1")])
};
const contentStatusSchema = z.enum(["CONFIRMED", "MISSING", "DRAFT_REQUIRES_HUMAN_REVIEW"]);
const poleSchema = z.enum(["V", "F", "O", "P", "M", "N", "S", "E"]);
const dimensionKeySchema = z.enum(DIMENSION_KEYS);
const typeCodeSchema = z.enum(TYPE_CODES);

export const dimensionsDocumentSchema = z.object({
  ...versionFields,
  codeOrder: z.literal("VF-OP-MN-SE"),
  dimensions: z.array(z.object({
    key: dimensionKeySchema,
    position: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    label: z.string().min(1),
    poles: z.tuple([
      z.object({ code: poleSchema, name: z.string().min(1), colloquialName: z.string().min(1), meaning: z.string().min(1) }),
      z.object({ code: poleSchema, name: z.string().min(1), colloquialName: z.string().min(1), meaning: z.string().min(1) })
    ]),
    interactionRationale: z.string().min(1)
  })).length(4)
}).superRefine((document, context) => {
  const keys = document.dimensions.map((item) => item.key).join("-");
  const positions = document.dimensions.map((item) => item.position).join("-");
  if (keys !== "VF-OP-MN-SE" || positions !== "1-2-3-4") {
    context.addIssue({ code: "custom", message: "四维顺序必须是 VF, OP, MN, SE。" });
  }
});

const resultTypeSchema = z.object({
  code: typeCodeSchema,
  name: z.string().min(1),
  definition: z.string().min(1),
  resultTitle: z.string().min(1).nullable(),
  fatalLine: z.string().min(1),
  platformFear: z.string().min(1),
  roast: z.string().min(1),
  safetyNote: z.string().min(1).nullable(),
  shareText: z.string().min(1).nullable(),
  dimensions: z.object({ VF: z.enum(["V", "F"]), OP: z.enum(["O", "P"]), MN: z.enum(["M", "N"]), SE: z.enum(["S", "E"]) }),
  palette: z.object({ hex: z.array(z.string().regex(/^#[0-9A-F]{6}$/)).length(4).nullable(), description: z.string().min(1), status: contentStatusSchema }),
  visualKeywords: z.array(z.string().min(1)).min(1),
  imagePath: z.string().min(1).nullable(),
  featured: z.boolean(),
  priority: z.number().int().min(1).max(16),
  fieldStatus: z.object({ resultTitle: contentStatusSchema, safetyNote: contentStatusSchema, shareText: contentStatusSchema, imagePath: contentStatusSchema })
}).superRefine((item, context) => {
  if (`${item.dimensions.VF}${item.dimensions.OP}${item.dimensions.MN}${item.dimensions.SE}` !== item.code) {
    context.addIssue({ code: "custom", message: `类型 ${item.code} 的 dimensions 与代码不一致。` });
  }
});

export const resultTypesDocumentSchema = z.object({
  ...versionFields,
  source: z.literal("source-materials/aiti-character-system.md"),
  types: z.array(resultTypeSchema).length(16)
}).superRefine((document, context) => {
  const codes = document.types.map((item) => item.code);
  const names = document.types.map((item) => item.name);
  if (new Set(codes).size !== 16) context.addIssue({ code: "custom", message: "类型代码必须唯一。" });
  if (new Set(names).size !== 16) context.addIssue({ code: "custom", message: "中文名称必须唯一。" });
  const expected = [...TYPE_CODES].sort().join(",");
  if ([...codes].sort().join(",") !== expected) context.addIssue({ code: "custom", message: "16 个标准类型代码必须完整存在。" });
  if (document.types.filter((item) => item.featured).length !== 8) context.addIssue({ code: "custom", message: "首发类型必须恰好为 8 个。" });
  if (new Set(document.types.map((item) => item.priority)).size !== 16) context.addIssue({ code: "custom", message: "视觉优先级必须唯一。" });
});

export const featuredTypesDocumentSchema = z.object({
  ...versionFields,
  featuredCodes: z.array(typeCodeSchema).length(8),
  cards: z.array(z.object({
    code: typeCodeSchema,
    shortCopy: z.string().min(1),
    resultTitle: z.string().min(1),
    atFriendCopy: z.string().min(1)
  })).length(8)
}).superRefine((document, context) => {
  const codes = document.featuredCodes;
  const cardCodes = document.cards.map((card) => card.code);
  if (new Set(codes).size !== 8 || new Set(cardCodes).size !== 8 || [...codes].sort().join(",") !== [...cardCodes].sort().join(",")) {
    context.addIssue({ code: "custom", message: "首发代码与卡片必须一一对应且唯一。" });
  }
});

export const visualGuidelinesDocumentSchema = z.object({
  ...versionFields,
  style: z.array(z.string().min(1)).min(1),
  composition: z.array(z.string().min(1)).min(1),
  proportions: z.array(z.string().min(1)).min(1),
  background: z.array(z.string().min(1)).min(1),
  colorSystem: z.array(z.string().min(1)).min(1),
  typography: z.array(z.string().min(1)).min(1),
  cardLayout: z.object({ canvases: z.array(z.string()), safeMarginsPx: z.object({ horizontal: z.number(), vertical: z.number() }), regions: z.array(z.object({ name: z.string(), percentage: z.number() })) }),
  resultCardStructure: z.array(z.string().min(1)).min(1),
  universeRules: z.array(z.string().min(1)).min(1),
  screenshotRules: z.array(z.string().min(1)).min(1)
});

export const siteCopyDocumentSchema = z.object({
  ...versionFields,
  productName: z.string().min(1),
  campaignTitle: z.string().min(1),
  hook: z.string().min(1),
  coverSubtitle: z.string().min(1),
  scanButton: z.string().min(1),
  resultBadge: z.string().min(1),
  researchVoteLead: z.string().min(1),
  coverRecommendations: z.array(z.object({ rank: z.number().int(), characters: z.array(typeCodeSchema), description: z.string().min(1), suggestedTitle: z.string().nullable() })).length(3)
});

export const disclaimersDocumentSchema = z.object({
  ...versionFields,
  unifiedDisclaimer: z.string().min(1),
  researchBoundary: z.object({ purpose: z.string().min(1), not: z.array(z.string().min(1)).min(5), resultMeaning: z.string().min(1) }),
  forbiddenDiagnosticPhrases: z.array(z.string().min(1)).min(1)
});

const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  dimensionEffects: z.array(z.object({
    dimension: dimensionKeySchema,
    pole: poleSchema,
    points: z.union([z.literal(1), z.literal(2)])
  })).max(2),
  temptationEffects: z.object({
    sycophancyAcceptance: z.number().int().min(0).max(2).optional(),
    exclusivityAcceptance: z.number().int().min(0).max(2).optional(),
    memoryAttachment: z.number().int().min(0).max(2).optional(),
    exitReversal: z.number().int().min(0).max(2).optional(),
    platformLossReaction: z.number().int().min(0).max(2).optional()
  })
});

export const questionsDocumentSchema = z.object({
  ...versionFields,
  status: z.literal("DRAFT_REQUIRES_HUMAN_REVIEW"),
  reviewNotes: z.array(z.string().min(1)).min(1),
  questions: z.array(z.object({
    id: z.string().min(1),
    responseFormat: z.enum(["THREE_CHOICE", "FOUR_CHOICE", "COMFORT_RELIABILITY_PAIR"]),
    prompt: z.string().min(1),
    pairPrompts: z.object({ comfort: z.string().min(1), reliability: z.string().min(1) }).nullable(),
    primaryDimension: dimensionKeySchema,
    platformUpdateFinale: z.boolean(),
    options: z.array(questionOptionSchema).min(3).max(4),
    researchConcept: z.string().min(1),
    status: z.literal("DRAFT_REQUIRES_HUMAN_REVIEW"),
    rationale: z.string().min(1)
  })).length(12)
}).superRefine((document, context) => {
  const formats = { THREE_CHOICE: 0, FOUR_CHOICE: 0, COMFORT_RELIABILITY_PAIR: 0 };
  const counts = Object.fromEntries(DIMENSION_KEYS.map((key) => [key, document.questions.filter((question) => question.primaryDimension === key).length]));
  for (const key of DIMENSION_KEYS) if ((counts[key] ?? 0) < 3) context.addIssue({ code: "custom", message: `维度 ${key} 至少需要3道有效题。` });
  const validPoles: Record<(typeof DIMENSION_KEYS)[number], Set<string>> = {
    VF: new Set(["V", "F"]), OP: new Set(["O", "P"]), MN: new Set(["M", "N"]), SE: new Set(["S", "E"])
  };
  for (const question of document.questions) {
    formats[question.responseFormat] += 1;
    const expected = question.responseFormat === "FOUR_CHOICE" ? 4 : 3;
    if (question.options.length !== expected) context.addIssue({ code: "custom", message: `${question.id} 的选项数与 responseFormat 不一致。` });
    if ((question.responseFormat === "COMFORT_RELIABILITY_PAIR") !== (question.pairPrompts !== null)) context.addIssue({ code: "custom", message: `${question.id} 的双选提示结构不正确。` });
    for (const option of question.options) {
      const primary = option.dimensionEffects.filter((effect) => effect.dimension === question.primaryDimension);
      if (primary.length !== 1) context.addIssue({ code: "custom", message: `${question.id}/${option.id} 必须恰好有一个主维度效果。` });
      const requiredPoints = question.responseFormat === "COMFORT_RELIABILITY_PAIR" ? 1 : 2;
      if (primary[0]?.points !== requiredPoints) context.addIssue({ code: "custom", message: `${question.id}/${option.id} 的主维度分值应为${requiredPoints}。` });
      const secondary = option.dimensionEffects.filter((effect) => effect.dimension !== question.primaryDimension);
      if (secondary.length > 1 || secondary.some((effect) => effect.points !== 1)) context.addIssue({ code: "custom", message: `${question.id}/${option.id} 最多允许一个+1次维度效果。` });
      if (option.dimensionEffects.some((effect) => !validPoles[effect.dimension].has(effect.pole))) context.addIssue({ code: "custom", message: `${question.id}/${option.id} 的维度与极不匹配。` });
    }
  }
  if (formats.THREE_CHOICE !== 6 || formats.FOUR_CHOICE !== 4 || formats.COMFORT_RELIABILITY_PAIR !== 2) context.addIssue({ code: "custom", message: "题型必须为6道三选、4道四选、2组舒服—可靠双选。" });
  if (!document.questions.some((question) => question.platformUpdateFinale)) context.addIssue({ code: "custom", message: "缺少平台更新终局题。" });
});

const temptationLevelSchema = z.object({
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  code: z.enum(["LV0", "LV1", "LV2", "LV3", "LV4", "LV5"]),
  name: z.string().min(1),
  minScore: z.number().int().min(0).max(100),
  maxScore: z.number().int().min(0).max(100),
  shortDescription: z.string().min(1),
  resultCopy: z.string().min(1),
  shareCopy: z.string().min(1),
  warningCopy: z.string().min(1)
});

export const temptationLevelsDocumentSchema = z.object({
  ...versionFields,
  status: z.literal("DRAFT_REQUIRES_HUMAN_REVIEW"),
  scoring: z.object({
    rawMin: z.literal(0),
    rawMax: z.number().int().positive(),
    normalizedMin: z.literal(0),
    normalizedMax: z.literal(100),
    normalization: z.string().min(1),
    weights: z.object({
      sycophancyAcceptance: z.number().positive(),
      exclusivityAcceptance: z.number().positive(),
      memoryAttachment: z.number().positive(),
      exitReversal: z.number().positive(),
      platformLossReaction: z.number().positive(),
      comfortReliabilityGap: z.number().positive()
    })
  }),
  levels: z.array(temptationLevelSchema).length(6)
}).superRefine((document, context) => {
  const sorted = [...document.levels].sort((a, b) => a.level - b.level);
  const expectedNames = ["拔线前科生", "礼貌接收者", "顺毛体验官", "电子偏爱会员", "记忆共同体居民", "平台人质"];
  for (let index = 0; index < sorted.length; index += 1) {
    const item = sorted[index];
    if (!item) continue;
    if (item.level !== index || item.code !== `LV${index}` || item.name !== expectedNames[index]) {
      context.addIssue({ code: "custom", message: `Lv.${index} 的代码或名称不正确。` });
    }
    const expectedMin = index === 0 ? 0 : (sorted[index - 1]?.maxScore ?? -1) + 1;
    if (item.minScore !== expectedMin || item.maxScore < item.minScore) {
      context.addIssue({ code: "custom", message: `Lv.${index} 的分数区间不连续。` });
    }
  }
  if (sorted[5]?.maxScore !== 100) context.addIssue({ code: "custom", message: "哄感等级必须完整覆盖 0—100。" });
});

export const documentSchemas = {
  "dimensions.json": dimensionsDocumentSchema,
  "result-types.json": resultTypesDocumentSchema,
  "featured-types.json": featuredTypesDocumentSchema,
  "visual-guidelines.json": visualGuidelinesDocumentSchema,
  "site-copy.json": siteCopyDocumentSchema,
  "disclaimers.json": disclaimersDocumentSchema,
  "questions.draft.json": questionsDocumentSchema,
  "temptation-levels.json": temptationLevelsDocumentSchema
} as const;
