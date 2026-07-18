"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createAnonymousSessionId, createEmptySession, PLAYTEST_STORAGE_KEY } from "./playtest";
import type { PlaytestRecord, PlaytestSession } from "./playtest";

interface PlaytestStore extends PlaytestSession {
  hydrated: boolean;
  feedbackRecords: PlaytestRecord[];
  markHydrated: () => void;
  start: () => void;
  answer: (questionId: string, optionId: string) => void;
  clearAnswer: (questionId: string) => void;
  complete: () => void;
  reset: () => void;
  saveFeedback: (record: PlaytestRecord) => void;
}

export const usePlaytestStore = create<PlaytestStore>()(persist((set) => ({
  ...createEmptySession(),
  hydrated: false,
  feedbackRecords: [],
  markHydrated: () => set({ hydrated: true }),
  start: () => set({ ...createEmptySession(), anonymousSessionId: createAnonymousSessionId(), startedAt: Date.now() }),
  answer: (questionId, optionId) => set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),
  clearAnswer: (questionId) => set((state) => {
    const answers = { ...state.answers };
    delete answers[questionId];
    return { answers };
  }),
  complete: () => set((state) => ({ completedAt: state.completedAt ?? Date.now() })),
  reset: () => set({ ...createEmptySession() }),
  saveFeedback: (record) => set((state) => ({ feedbackRecords: [...state.feedbackRecords, record] }))
}), {
  name: PLAYTEST_STORAGE_KEY,
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    anonymousSessionId: state.anonymousSessionId,
    answers: state.answers,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
    feedbackRecords: state.feedbackRecords
  }),
  onRehydrateStorage: () => (state) => state?.markHydrated()
}));
