"use client";

import { useEffect } from "react";
import { usePlaytestStore } from "../src/playtest-store";

export function StoreHydrator() {
  const markHydrated = usePlaytestStore((state) => state.markHydrated);
  useEffect(() => { markHydrated(); }, [markHydrated]);
  return null;
}
