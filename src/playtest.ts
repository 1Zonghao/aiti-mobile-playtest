import type { Answer, ScoreResult, TemptationLevel, TypeCode } from "./types";

export const PLAYTEST_STORAGE_KEY = "aiti-playtest-v1";
export const CONTENT_VERSION = "2026.07.18";
export const SCORING_VERSION = "1.0.0";
export const APP_VERSION = "2.0.0";
export type YesNo = "yes" | "no";

export interface PlaytestFeedback {
  completionTimeSeconds: number;
  resultType: TypeCode;
  temptationLevel: TemptationLevel;
  comfortReliabilityGap: number;
  hardestQuestionId: string;
  obviousSafeAnswerQuestionIds: string[];
  unrealisticOptionQuestionIds: string[];
  resultAccuracyRating: 1 | 2 | 3 | 4 | 5;
  offensivenessRating: 1 | 2 | 3 | 4 | 5;
  willingToScreenshot: YesNo;
  willingToReadResearch: YesNo;
  willingToVote: YesNo;
  optionalComment: string;
}

export interface PlaytestRecord {
  anonymousSessionId: string;
  timestamp: string;
  completionTime: number;
  answerTrace: ScoreResult["answerTrace"];
  resultType: TypeCode;
  temptationLevel: TemptationLevel;
  feedback: PlaytestFeedback;
}

export interface PlaytestSession {
  anonymousSessionId: string | null;
  answers: Record<string, string>;
  startedAt: number | null;
  completedAt: number | null;
  currentQuestionIndex: number;
  updateChoice: string | null;
  result: Pick<ScoreResult, "typeCode" | "temptationLevel" | "comfortReliabilityGap"> | null;
  completed: boolean;
  contentVersion: string;
  scoringVersion: string;
  appVersion: string;
}

export function createAnonymousSessionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptySession(): PlaytestSession {
  return {
    anonymousSessionId: null,
    answers: {},
    startedAt: null,
    completedAt: null,
    currentQuestionIndex: 0,
    updateChoice: null,
    result: null,
    completed: false,
    contentVersion: CONTENT_VERSION,
    scoringVersion: SCORING_VERSION,
    appVersion: APP_VERSION
  };
}

export function orderedAnswers(questionIds: string[], answers: Record<string, string>): Answer[] {
  return questionIds.flatMap((questionId) => {
    const optionId = answers[questionId];
    return optionId ? [{ questionId, optionId }] : [];
  });
}

export function completionTimeSeconds(startedAt: number | null, completedAt: number | null, now = Date.now()): number {
  if (startedAt === null) return 0;
  return Math.max(0, Math.round(((completedAt ?? now) - startedAt) / 1000));
}

export function createPlaytestRecord(session: Pick<PlaytestSession, "anonymousSessionId" | "answers" | "startedAt" | "completedAt">, score: ScoreResult, feedback: PlaytestFeedback, timestamp = new Date().toISOString()): PlaytestRecord {
  if (!session.anonymousSessionId) throw new Error("试玩会话尚未开始。");
  return {
    anonymousSessionId: session.anonymousSessionId,
    timestamp,
    completionTime: completionTimeSeconds(session.startedAt, session.completedAt),
    answerTrace: score.answerTrace,
    resultType: score.typeCode,
    temptationLevel: score.temptationLevel,
    feedback
  };
}

function csvCell(value: unknown): string {
  const valueText = typeof value === "string" ? value : JSON.stringify(value);
  return `"${valueText.replaceAll('"', '""')}"`;
}

export function recordsToCsv(records: PlaytestRecord[]): string {
  const headers = ["anonymousSessionId", "timestamp", "completionTime", "answerTrace", "resultType", "temptationLevel", "feedback"];
  return [headers.join(","), ...records.map((record) => [
    record.anonymousSessionId,
    record.timestamp,
    record.completionTime,
    record.answerTrace,
    record.resultType,
    record.temptationLevel,
    record.feedback
  ].map(csvCell).join(","))].join("\n");
}

export function isDebugEnabled(environment: string | undefined): boolean {
  return environment === "development";
}
