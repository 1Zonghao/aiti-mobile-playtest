"use client";

import { useRouter } from "next/navigation";
import { usePlaytestStore } from "../src/playtest-store";

export function StartButton() {
  const router = useRouter();
  const start = usePlaytestStore((state) => state.start);
  return <button className="button w-full" onClick={() => { start(); router.push("/test"); }}>开始试玩</button>;
}
