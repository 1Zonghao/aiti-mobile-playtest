"use client";

import { useEffect } from "react";
import { usePlaytestStore } from "../src/playtest-store";

export function StoreHydrator() {
  const markHydrated = usePlaytestStore((state) => state.markHydrated);
  const mismatch = usePlaytestStore((state) => state.versionMismatch);
  const acknowledge = usePlaytestStore((state) => state.acknowledgeVersionMismatch);
  useEffect(() => { markHydrated(); }, [markHydrated]);
  if (!mismatch) return null;
  return <div className="fixed inset-x-3 top-3 z-50 mx-auto max-w-xl border-2 border-[var(--rule)] bg-[var(--white)] p-3 shadow-[4px_4px_0_var(--rule)]" role="status"><p className="m-0 text-sm font-bold">内容版本已更新，旧测试进度已安全清除，请重新开始。</p><button className="text-link" onClick={acknowledge}>知道了</button></div>;
}
