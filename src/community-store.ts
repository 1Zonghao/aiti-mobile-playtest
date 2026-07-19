"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TemptationLevel, TypeCode } from "./types";

export interface CommunityComment {
  id: string;
  nickname: string;
  timestamp: string;
  message: string;
  resultType: TypeCode | null;
  temptationLevel: TemptationLevel | null;
}

export interface TestHistoryEntry {
  anonymousSessionId: string;
  timestamp: string;
  completionTime: number;
  typeCode: TypeCode;
  temptationLevel: TemptationLevel;
  comfortReliabilityGap: number;
}

interface CommunityStore {
  comments: CommunityComment[];
  history: TestHistoryEntry[];
  addComment: (comment: Omit<CommunityComment, "id" | "timestamp">) => void;
  addHistory: (entry: Omit<TestHistoryEntry, "timestamp">) => void;
  clearHistory: () => void;
}

function genId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `cmt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set) => ({
      comments: [],
      history: [],
      addComment: (comment) =>
        set((state) => ({
          comments: [
            { ...comment, id: genId(), timestamp: new Date().toISOString() },
            ...state.comments
          ].slice(0, 200)
        })),
      addHistory: (entry) =>
        set((state) => ({
          history: [
            { ...entry, timestamp: new Date().toISOString() },
            ...state.history
          ].slice(0, 50)
        })),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: "aiti-community-v1",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
