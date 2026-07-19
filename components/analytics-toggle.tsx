"use client";

import { usePlaytestStore } from "../src/playtest-store";

export function AnalyticsToggle() {
  const enabled = usePlaytestStore((state) => state.analytics.enabled);
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const setEnabled = usePlaytestStore((state) => state.setAnalyticsEnabled);
  if (!hydrated) return null;
  return <label className="toggle"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /><span>允许在本机记录匿名完成次数与入口点击</span></label>;
}
