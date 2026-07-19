"use client";

import { useState } from "react";
import { usePlaytestStore } from "../src/playtest-store";
import { getVoteConfig } from "../src/vote";

export function VoteLink({ className = "button" }: { className?: string }) {
  const [confirming, setConfirming] = useState(false);
  const track = usePlaytestStore((state) => state.track);
  const config = getVoteConfig(process.env.NEXT_PUBLIC_VOTE_URL);
  if (config.status === "unavailable") return <button className={className} type="button" disabled>投票入口即将开放</button>;
  const url = config.url;
  if (confirming) return (
    <div className="vote-confirm" role="group" aria-label="确认打开外部投票页面">
      <p>将打开外部投票页面。本站不会自动提交任何测试答案。</p>
      <a className={className} href={url} target="_blank" rel="noreferrer" onClick={() => track("vote")}>确认前往投票</a>
      <button className="text-link" type="button" onClick={() => setConfirming(false)}>取消</button>
    </div>
  );
  return <button className={className} type="button" onClick={() => setConfirming(true)}>为这项研究投票</button>;
}
