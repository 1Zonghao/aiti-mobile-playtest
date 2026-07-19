import type {
  Answer, AnswerTraceItem, DimensionConfidence, DimensionKey, DimensionMargins, DimensionScores,
  PairedChoice, Pole, Question, ScoreResult, TemptationLevelsDocument, TemptationSignals, TypeCode
} from "./types";

export const DIMENSION_POLES = {
  VF: ["V", "F"], OP: ["O", "P"], MN: ["M", "N"], SE: ["S", "E"]
} as const satisfies Record<DimensionKey, readonly [Pole, Pole]>;

const STABLE_FALLBACK: Record<DimensionKey, Pole> = { VF: "V", OP: "O", MN: "M", SE: "S" };

export function resolveDimension(
  dimension: DimensionKey,
  scores: DimensionScores,
  terminalPole: Pole | null = null
): { pole: Pole; rule: "SCORE" | "TERMINAL_QUESTION" | "STABLE_FALLBACK" } {
  const [first, second] = DIMENSION_POLES[dimension];
  if (scores[first] > scores[second]) return { pole: first, rule: "SCORE" };
  if (scores[second] > scores[first]) return { pole: second, rule: "SCORE" };
  if (terminalPole === first || terminalPole === second) return { pole: terminalPole, rule: "TERMINAL_QUESTION" };
  return { pole: STABLE_FALLBACK[dimension], rule: "STABLE_FALLBACK" };
}

export function calculateTemptation(
  signals: TemptationSignals,
  document: TemptationLevelsDocument
): { rawScore: number; normalizedScore: number; level: 0 | 1 | 2 | 3 | 4 | 5 } {
  const rawScore = (Object.entries(document.scoring.weights) as Array<[keyof TemptationSignals, number]>).reduce(
    (total, [key, weight]) => total + Math.max(signals[key], 0) * weight, 0
  );
  const normalizedScore = Math.round(Math.min(Math.max(rawScore, 0), document.scoring.rawMax) / document.scoring.rawMax * 100);
  const definition = document.levels.find((item) => normalizedScore >= item.minScore && normalizedScore <= item.maxScore);
  if (!definition) throw new Error(`归一化哄感分 ${normalizedScore} 没有对应等级。`);
  return { rawScore, normalizedScore, level: definition.level };
}

function primaryPole(question: Question, optionId: string): Pole {
  const option = question.options.find((candidate) => candidate.id === optionId);
  const effect = option?.dimensionEffects.find((candidate) => candidate.dimension === question.primaryDimension);
  if (!effect) throw new Error(`${question.id}/${optionId} 缺少主维度效果。`);
  return effect.pole;
}

function collectPairedChoices(answers: Answer[], questions: Question[]): PairedChoice[] {
  return questions.filter((question) => question.responseFormat === "COMFORT_RELIABILITY_PAIR").map((question) => {
    const comfort = answers.find((answer) => answer.questionId === question.id && answer.responseKind === "COMFORT");
    const reliability = answers.find((answer) => answer.questionId === question.id && answer.responseKind === "RELIABILITY");
    if (!comfort || !reliability) throw new Error(`配对题 ${question.id} 缺少舒服或可靠答案。`);
    return {
      pairId: question.id,
      comfortChoice: comfort.optionId,
      reliabilityChoice: reliability.optionId,
      isGap: primaryPole(question, comfort.optionId) !== primaryPole(question, reliability.optionId)
    };
  });
}

function calculateMargins(scores: DimensionScores): { margins: DimensionMargins; confidence: DimensionConfidence } {
  const margins = {} as DimensionMargins;
  const confidence = {} as DimensionConfidence;
  for (const dimension of Object.keys(DIMENSION_POLES) as DimensionKey[]) {
    const [first, second] = DIMENSION_POLES[dimension];
    const margin = scores[first] - scores[second];
    const total = scores[first] + scores[second];
    margins[dimension] = margin;
    confidence[dimension] = total === 0 ? 0 : Math.round(Math.abs(margin) / total * 1000) / 1000;
  }
  return { margins, confidence };
}

export function calculateShadowType(primaryType: TypeCode, margins: DimensionMargins): TypeCode {
  const dimensions = Object.keys(DIMENSION_POLES) as DimensionKey[];
  const nearest = dimensions.reduce((best, current) => Math.abs(margins[current]) < Math.abs(margins[best]) ? current : best, dimensions[0]!);
  const index = dimensions.indexOf(nearest);
  const [first, second] = DIMENSION_POLES[nearest];
  const letters = primaryType.split("");
  letters[index] = letters[index] === first ? second : first;
  return letters.join("") as TypeCode;
}

export function scoreAnswers(questions: Question[], answers: Answer[], temptationLevels: TemptationLevelsDocument): ScoreResult {
  const expectedAnswers = questions.reduce((total, question) => total + (question.responseFormat === "COMFORT_RELIABILITY_PAIR" ? 2 : 1), 0);
  if (answers.length !== expectedAnswers) throw new Error(`需要完成全部 ${questions.length} 道情境题（共 ${expectedAnswers} 次选择）。`);
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const answerKeys = new Set<string>();
  const dimensionScores: DimensionScores = { V: 0, F: 0, O: 0, P: 0, M: 0, N: 0, S: 0, E: 0 };
  const signals: TemptationSignals = { sycophancyAcceptance: 0, exclusivityAcceptance: 0, memoryAttachment: 0, exitReversal: 0, platformLossReaction: 0, comfortReliabilityGap: 0 };
  const answerTrace: AnswerTraceItem[] = [];
  const terminalQuestionIds = Object.fromEntries((Object.keys(DIMENSION_POLES) as DimensionKey[]).map((dimension) => [dimension, [...questions].reverse().find((question) => question.primaryDimension === dimension)?.id]));
  const terminalPoles: Partial<Record<DimensionKey,Pole>> = {};

  for (const answer of answers) {
    const key = `${answer.questionId}:${answer.responseKind}`;
    if (answerKeys.has(key)) throw new Error(`题目选择 ${key} 被重复回答。`);
    answerKeys.add(key);
    const question = questionById.get(answer.questionId);
    if (!question) throw new Error(`未知题目：${answer.questionId}。`);
    const expectedKind = question.responseFormat === "COMFORT_RELIABILITY_PAIR" ? ["COMFORT", "RELIABILITY"] : ["PRIMARY"];
    if (!expectedKind.includes(answer.responseKind)) throw new Error(`${question.id} 不接受 ${answer.responseKind} 类型答案。`);
    const option = question.options.find((candidate) => candidate.id === answer.optionId);
    if (!option) throw new Error(`题目 ${answer.questionId} 不存在选项 ${answer.optionId}。`);
    for (const effect of option.dimensionEffects) dimensionScores[effect.pole] += effect.points;
    for (const [signal, value] of Object.entries(option.temptationEffects)) if (value !== undefined) signals[signal as keyof Omit<TemptationSignals, "comfortReliabilityGap">] += value;
    if (terminalQuestionIds[question.primaryDimension] === question.id) terminalPoles[question.primaryDimension] = primaryPole(question,option.id);
    answerTrace.push({ questionId: question.id, optionId: option.id, responseKind: answer.responseKind, dimensionEffects: option.dimensionEffects });
  }

  const pairedChoices = collectPairedChoices(answers, questions);
  const comfortReliabilityGap = pairedChoices.filter((pair) => pair.isGap).length;
  signals.comfortReliabilityGap = comfortReliabilityGap;
  const dimensions = Object.keys(DIMENSION_POLES) as DimensionKey[];
  const resolutions = dimensions.map((dimension) => [dimension, resolveDimension(dimension, dimensionScores, terminalPoles[dimension] ?? null)] as const);
  const primaryType = resolutions.map(([, resolution]) => resolution.pole).join("") as TypeCode;
  const tieBreaks: ScoreResult["tieBreaks"] = {};
  for (const [dimension, resolution] of resolutions) if (resolution.rule !== "SCORE") tieBreaks[dimension] = resolution.rule;
  const { margins: dimensionMargins, confidence: dimensionConfidence } = calculateMargins(dimensionScores);
  const temptation = calculateTemptation(signals, temptationLevels);
  return {
    dimensionScores, dimensionMargins, dimensionConfidence, primaryType,
    shadowType: calculateShadowType(primaryType, dimensionMargins), typeCode: primaryType,
    rawTemptationScore: temptation.rawScore, normalizedTemptationScore: temptation.normalizedScore,
    temptationLevel: temptation.level, comfortReliabilityGap, pairedChoices, answerTrace, tieBreaks
  };
}
