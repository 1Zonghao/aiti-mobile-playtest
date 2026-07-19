"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { APP_VERSION, CONTENT_VERSION, createAnonymousSessionId, createEmptySession, PLAYTEST_STORAGE_KEY, SCORING_VERSION } from "./playtest";
import type { PlaytestRecord, PlaytestSession } from "./playtest";
import type { ScoreResult } from "./types";
import type { Answer } from "./types";
import { answerStorageKey } from "./playtest";

export interface LocalAnalytics {
  enabled: boolean;
  completions: number;
  typeCounts: Record<string, number>;
  levelCounts: Record<string, number>;
  researchClicks: number;
  voteClicks: number;
}

const emptyAnalytics: LocalAnalytics = { enabled: true, completions: 0, typeCounts: {}, levelCounts: {}, researchClicks: 0, voteClicks: 0 };

interface PlaytestStore extends PlaytestSession {
  hydrated: boolean;
  feedbackRecords: PlaytestRecord[];
  versionMismatch: boolean;
  analytics: LocalAnalytics;
  markHydrated: () => void;
  start: () => void;
  answer: (questionId: string, optionId: string, responseKind?: Answer["responseKind"]) => void;
  clearAnswer: (questionId: string) => void;
  setCurrentQuestion: (index: number) => void;
  complete: (score?: ScoreResult) => void;
  reset: () => void;
  saveFeedback: (record: PlaytestRecord) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  track: (event: "research" | "vote") => void;
  acknowledgeVersionMismatch: () => void;
}

export const usePlaytestStore = create<PlaytestStore>()(persist((set) => ({
  ...createEmptySession(),
  hydrated: false,
  feedbackRecords: [],
  versionMismatch: false,
  analytics: emptyAnalytics,
  markHydrated: () => set({ hydrated: true }),
  start: () => set({ ...createEmptySession(), anonymousSessionId: createAnonymousSessionId(), startedAt: Date.now() }),
  answer: (questionId, optionId, responseKind = "PRIMARY") => set((state) => ({ answers: { ...state.answers, [answerStorageKey(questionId, responseKind)]: optionId }, updateChoice: questionId === "q12_update_exit" ? optionId : state.updateChoice, result: null, completed: false })),
  clearAnswer: (questionId) => set((state) => {
    const answers = { ...state.answers };
    delete answers[questionId];
    delete answers[answerStorageKey(questionId, "COMFORT")];
    delete answers[answerStorageKey(questionId, "RELIABILITY")];
    return { answers, result: null, completed: false };
  }),
  setCurrentQuestion: (currentQuestionIndex) => set({ currentQuestionIndex }),
  complete: (score) => set((state) => {
    const result = score ? { typeCode: score.typeCode, temptationLevel: score.temptationLevel, comfortReliabilityGap: score.comfortReliabilityGap } : state.result;
    const analytics = state.analytics.enabled && score && !state.completed ? {
      ...state.analytics,
      completions: state.analytics.completions + 1,
      typeCounts: { ...state.analytics.typeCounts, [score.typeCode]: (state.analytics.typeCounts[score.typeCode] ?? 0) + 1 },
      levelCounts: { ...state.analytics.levelCounts, [score.temptationLevel]: (state.analytics.levelCounts[score.temptationLevel] ?? 0) + 1 }
    } : state.analytics;
    return { completedAt: state.completedAt ?? Date.now(), completed: true, result, analytics };
  }),
  reset: () => set({ ...createEmptySession() }),
  saveFeedback: (record) => set((state) => ({ feedbackRecords: [...state.feedbackRecords, record] })),
  setAnalyticsEnabled: (enabled) => set((state) => ({ analytics: { ...state.analytics, enabled } })),
  track: (event) => set((state) => state.analytics.enabled ? { analytics: { ...state.analytics, [event === "research" ? "researchClicks" : "voteClicks"]: state.analytics[event === "research" ? "researchClicks" : "voteClicks"] + 1 } } : {}),
  acknowledgeVersionMismatch: () => set({ versionMismatch: false })
}), {
  name: PLAYTEST_STORAGE_KEY,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    anonymousSessionId: state.anonymousSessionId,
    answers: state.answers,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
    currentQuestionIndex: state.currentQuestionIndex,
    updateChoice: state.updateChoice,
    result: state.result,
    completed: state.completed,
    contentVersion: state.contentVersion,
    scoringVersion: state.scoringVersion,
    appVersion: state.appVersion,
    feedbackRecords: state.feedbackRecords,
    analytics: state.analytics
  }),
  merge: (persisted, current) => {
    const saved = persisted as Partial<PlaytestStore>;
    const compatible = saved.contentVersion === CONTENT_VERSION && saved.scoringVersion === SCORING_VERSION && saved.appVersion === APP_VERSION;
    if (!compatible) return { ...current, feedbackRecords: saved.feedbackRecords ?? [], analytics: saved.analytics ?? emptyAnalytics, versionMismatch: Boolean(saved.anonymousSessionId) };
    return { ...current, ...saved, hydrated: false };
  },
  onRehydrateStorage: () => (state) => state?.markHydrated()
}));
