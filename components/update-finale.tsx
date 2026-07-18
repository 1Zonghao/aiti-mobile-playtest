"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { questionsContent } from "../src/content";
import { usePlaytestStore } from "../src/playtest-store";

const updateQuestion = questionsContent.questions.find((question) => question.id === "q12_update_exit");
if (!updateQuestion) throw new Error("缺少平台更新终局题。");

export function UpdateFinale() {
  const question = updateQuestion;
  if (!question) throw new Error("缺少平台更新终局题。");
  const router = useRouter();
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const answer = usePlaytestStore((state) => state.answer);
  const clearAnswer = usePlaytestStore((state) => state.clearAnswer);
  const complete = usePlaytestStore((state) => state.complete);
  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) router.replace("/");
    else if (Object.keys(answers).length < 11) router.replace("/test");
  }, [answers, hydrated, router, sessionId]);
  if (!hydrated || !sessionId) return <main className="screen"><p>正在恢复试玩进度…</p></main>;
  if (Object.keys(answers).length < 11) return <main className="screen"><p>正在返回上一题…</p></main>;

  return (
    <main className="screen gap-5">
      <header>
        <div className="mb-2 flex items-center justify-between"><span className="label">平台更新事件 / 12 of 12</span><span className="text-sm">终局选择</span></div>
        <div className="h-2 border border-[var(--rule)] bg-[var(--accent)]" />
      </header>
      <section className="panel mt-4 p-5">
        <p className="label m-0">VERSION CHANGE</p>
        <h1 className="mb-3 mt-3 text-[30px] font-black leading-tight">熟悉的称呼和共同记忆消失了</h1>
        <p className="m-0 leading-7">更新后的 AI 仍能回答，但人格版本已经变化。数据可以完整导出，也没有真实系统故障。</p>
      </section>
      <section className="flex flex-1 flex-col justify-center">
        <h2 className="text-xl font-black">{question.prompt}</h2>
        <div className="mt-4 space-y-4">
          {question.options.map((option) => <button key={option.id} className="option" data-selected={answers[question.id] === option.id} onClick={() => { answer(question.id, option.id); complete(); router.push("/result"); }}>{option.text}</button>)}
        </div>
      </section>
      <button className="button secondary w-full" onClick={() => { clearAnswer("q11_support_consistency"); router.push("/test"); }}>返回上一题</button>
    </main>
  );
}
