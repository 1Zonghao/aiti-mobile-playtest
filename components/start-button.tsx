"use client";

import { useRouter } from "next/navigation";
import { usePlaytestStore } from "../src/playtest-store";

export function StartButton() {
  const router = useRouter();
  const start = usePlaytestStore((state) => state.start);
  return <button className="button" onClick={() => { start(); router.push("/test"); }}>让我看看AI怎么哄我</button>;
}
