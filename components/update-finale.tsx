"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questionsContent, temptationLevelsContent } from "../src/content";
import { orderedAnswers } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import { scoreAnswers } from "../src/scoring";

const question = questionsContent.questions.find((item) => item.id === "q12_update_exit")!;

export function UpdateFinale() {
  const router = useRouter();
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const answer = usePlaytestStore((state) => state.answer);
  const complete = usePlaytestStore((state) => state.complete);
  const [phase, setPhase] = useState(1);
  const [pending, setPending] = useState(false);
  const questionId = question.id;
  const enoughAnswers = Object.keys(answers).filter((key) => key !== questionId).length >= 11;
  const prefersReduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) router.replace("/");
    else if (!enoughAnswers) router.replace("/test");
  }, [enoughAnswers, hydrated, router, sessionId]);
  useEffect(() => {
    if (!hydrated || !enoughAnswers || prefersReduced || phase >= 3) return;
    const timer = window.setTimeout(() => setPhase((value) => value + 1), phase === 1 ? 1900 : 1500);
    return () => window.clearTimeout(timer);
  }, [enoughAnswers, hydrated, phase, prefersReduced]);
  if (!hydrated || !sessionId || !enoughAnswers) return <main className="screen"><p>正在恢复更新现场…</p></main>;

  function choose(optionId: string) {
    if (pending) return;
    setPending(true);
    answer(questionId, optionId);
    const nextAnswers = { ...answers, [questionId]: optionId };
    const score = scoreAnswers(questionsContent.questions, orderedAnswers(questionsContent.questions.map((item) => item.id), nextAnswers), temptationLevelsContent);
    complete(score);
    window.setTimeout(() => router.push("/result"), prefersReduced ? 20 : 300);
  }

  return (
    <main className="update-stage" data-phase={phase}>
      <div className="screen gap-5">
        <header><div className="mb-2 flex items-center justify-between"><span className="label">平台更新事件 / 12 of 12</span><span className="label">PHASE {phase}/4</span></div><div className="progress-track"><div className="progress-fill w-full" /></div></header>
        <section className="panel update-console p-5" aria-live="polite">
          <div className="glitch-line" />
          {phase === 1 && <><p className="eyebrow">更新前 · 熟悉模式</p><h1 className="mt-4 text-3xl font-black">“小鱼，你又替豆包担心了。”</h1><p className="leading-7">它记得你的称呼、猫的名字，也记得你说“算了”通常不是真的算了。</p><div><span className="memory-chip">小鱼</span><span className="memory-chip">豆包</span><span className="memory-chip">嘴硬识别</span></div></>}
          {phase === 2 && <><p className="eyebrow">版本迁移中</p><h1 className="mt-4 text-3xl font-black">人格模块 3.7 → 4.0</h1><p className="leading-7">正在迁移记忆摘要。旧人格版本恢复状态：未知。</p><div><span className="memory-chip">称呼 / 迁移中</span><span className="memory-chip">共同记忆 / 重建</span><span className="memory-chip">语气 / 替换</span></div></>}
          {phase >= 3 && <><p className="eyebrow">更新后 · 标准模式</p><h1 className="mt-4 text-3xl font-black">“您好，有什么可以帮您？”</h1><p className="leading-7">称呼已消失，共同记忆无法识别。聊天记录仍可下载，但熟悉的版本没有回来。</p><div><span className="memory-chip">用户</span><span className="memory-chip">历史摘要不可用</span><span className="memory-chip">标准助手</span></div></>}
        </section>
        {phase < 3 ? <button className="button secondary" onClick={() => setPhase(3)}>跳过更新过程</button> : <section className="grid flex-1 content-center gap-4"><h2 className="text-2xl font-black">{question.prompt}</h2>{question.options.map((option) => <button key={option.id} className="option" disabled={pending} onClick={() => choose(option.id)}>{option.text}</button>)}</section>}
        <button className="text-link" onClick={() => router.push("/test")}>返回修改前面的答案</button>
      </div>
    </main>
  );
}
