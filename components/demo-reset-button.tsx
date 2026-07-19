"use client";

import { useState } from "react";
import { usePlaytestStore } from "../src/playtest-store";

export function DemoResetButton() {
  const reset = usePlaytestStore((state) => state.reset);
  const [cleared, setCleared] = useState(false);
  return <button className="button secondary" type="button" onClick={() => { reset(); setCleared(true); }}>{cleared ? "上一位状态已清除" : "清除上一位测试状态"}</button>;
}
