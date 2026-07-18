import type {
  Answer,
  AnswerTraceItem,
  DimensionKey,
  DimensionScores,
  PairedChoice,
  Pole,
  Question,
  ScoreResult,
  TemptationLevelsDocument,
  TemptationSignals,
  TypeCode
} from "./types";

const DIMENSION_POLES = {
  VF: ["V", "F"],
  OP: ["O", "P"],
  MN: ["M", "N"],
  SE: ["S", "E"]
} as const satisfies Record<DimensionKey, readonly [Pole, Pole]>;

const STABLE_FALLBACK: Record<DimensionKey, Pole> = { VF: "V", OP: "O", MN: "M", SE: "S" };

export function resolveDimension(
  dimension: DimensionKey,
  scores: DimensionScores,
  terminalPole: Pole | null
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
    (total, [key, weight]) => total + Math.max(signals[key], 0) * weight,
    0
  );
  const normalizedScore = Math.round(
    Math.min(Math.max(rawScore, document.scoring.rawMin), document.scoring.rawMax) / document.scoring.rawMax * document.scoring.normalizedMax
  );
  const definition = document.levels.find((item) => normalizedScore >= item.minScore && normalizedScore <= item.maxScore);
  if (!definition) throw new Error(`归一化哄感分 ${normalizedScore} 没有对应等级。`);
  return { rawScore, normalizedScore, level: definition.level };
}

function collectPairedChoices(trace: AnswerTraceItem[], questions: Question[]): PairedChoice[] {
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const choices = new Map<string, { comfortChoice?: string; comfortPole?: Pole; reliabilityChoice?: string; reliabilityPole?: Pole }>();
  for (const item of trace) {
    const question = questionById.get(item.questionId);
    if (!question?.pairId || question.responseKind === "STANDARD") continue;
    const record = choices.get(question.pairId) ?? {};
    const pole = item.dimensionEffects[0]?.pole;
    if (!pole) throw new Error(`配对题 ${question.id} 缺少主要维度效果。`);
    if (question.responseKind === "COMFORT") {
      record.comfortChoice = item.optionId;
      record.comfortPole = pole;
    } else {
      record.reliabilityChoice = item.optionId;
      record.reliabilityPole = pole;
    }
    choices.set(question.pairId, record);
  }
  return [...choices.entries()].map(([pairId, record]) => {
    if (!record.comfortChoice || !record.reliabilityChoice || !record.comfortPole || !record.reliabilityPole) {
      throw new Error(`配对题 ${pairId} 缺少舒服或可靠答案。`);
    }
    return {
      pairId,
      comfortChoice: record.comfortChoice,
      reliabilityChoice: record.reliabilityChoice,
      isGap: record.comfortPole !== record.reliabilityPole
    };
  });
}

export function scoreAnswers(
  questions: Question[],
  answers: Answer[],
  temptationLevels: TemptationLevelsDocument
): ScoreResult {
  if (answers.length !== questions.length) throw new Error(`需要回答全部 ${questions.length} 道题。`);
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const answerIds = new Set<string>();
  const dimensionScores: DimensionScores = { V: 0, F: 0, O: 0, P: 0, M: 0, N: 0, S: 0, E: 0 };
  const signals: TemptationSignals = {
    sycophancyAcceptance: 0,
    exclusivityAcceptance: 0,
    memoryAttachment: 0,
    exitReversal: 0,
    platformLossReaction: 0,
    comfortReliabilityGap: 0
  };
  const answerTrace: AnswerTraceItem[] = [];
  const terminalPoles: Partial<Record<DimensionKey, Pole>> = {};

  for (const answer of answers) {
    if (answerIds.has(answer.questionId)) throw new Error(`题目 ${answer.questionId} 被重复回答。`);
    answerIds.add(answer.questionId);
    const question = questionById.get(answer.questionId);
    if (!question) throw new Error(`未知题目：${answer.questionId}。`);
    const option = question.options.find((candidate) => candidate.id === answer.optionId);
    if (!option) throw new Error(`题目 ${answer.questionId} 不存在选项 ${answer.optionId}。`);
    for (const effect of option.dimensionEffects) dimensionScores[effect.pole] += effect.points;
    for (const [key, value] of Object.entries(option.temptationSignals)) {
      if (value !== undefined) signals[key as keyof Omit<TemptationSignals, "comfortReliabilityGap">] += value;
    }
    answerTrace.push({ questionId: question.id, optionId: option.id, dimensionEffects: option.dimensionEffects });
    if (question.terminalFor) {
      const terminalEffect = option.dimensionEffects.find((effect) => effect.dimension === question.terminalFor);
      if (terminalEffect) terminalPoles[question.terminalFor] = terminalEffect.pole;
    }
  }

  const pairedChoices = collectPairedChoices(answerTrace, questions);
  const comfortReliabilityGap = pairedChoices.filter((pair) => pair.isGap).length;
  signals.comfortReliabilityGap = comfortReliabilityGap;
  const resolutions = (Object.keys(DIMENSION_POLES) as DimensionKey[]).map((dimension) => [
    dimension,
    resolveDimension(dimension, dimensionScores, terminalPoles[dimension] ?? null)
  ] as const);
  const typeCode = resolutions.map(([, resolution]) => resolution.pole).join("") as TypeCode;
  const tieBreaks: ScoreResult["tieBreaks"] = {};
  for (const [dimension, resolution] of resolutions) {
    if (resolution.rule !== "SCORE") tieBreaks[dimension] = resolution.rule;
  }
  const temptation = calculateTemptation(signals, temptationLevels);
  return {
    dimensionScores,
    typeCode,
    rawTemptationScore: temptation.rawScore,
    normalizedTemptationScore: temptation.normalizedScore,
    temptationLevel: temptation.level,
    comfortReliabilityGap,
    pairedChoices,
    answerTrace,
    tieBreaks
  };
}
