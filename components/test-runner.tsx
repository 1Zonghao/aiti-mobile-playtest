"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questionsContent } from "../src/content";
import { usePlaytestStore } from "../src/playtest-store";

const standardQuestions = questionsContent.questions.filter((question) => question.id !== "q12_update_exit");

export function TestRunner() {
  const router = useRouter();
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const answer = usePlaytestStore((state) => state.answer);
  const initialIndex = useMemo(() => {
    const index = standardQuestions.findIndex((question) => !answers[question.id]);
    return index < 0 ? standardQuestions.length : index;
  }, [answers]);
  const [index, setIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!hydrated || initialized) return;
    if (!sessionId) { router.replace("/"); return; }
    if (initialIndex >= standardQuestions.length) { router.replace("/update"); return; }
    setIndex(initialIndex);
    setInitialized(true);
  }, [hydrated, initialIndex, initialized, router, sessionId]);

  if (!hydrated || !initialized) return <main className="screen"><p>正在恢复试玩进度…</p></main>;
  const question = standardQuestions[index];
  if (!question) return null;
  const questionId = question.id;
  const progress = ((index + 1) / questionsContent.questions.length) * 100;

  function choose(optionId: string) {
    answer(questionId, optionId);
    if (index === standardQuestions.length - 1) router.push("/update");
    else setIndex((value) => value + 1);
  }

  return (
    <main className="screen gap-5">
      <header>
        <div className="mb-2 flex items-center justify-between"><span className="label">问题 {index + 1}/12</span><span className="text-sm text-[var(--muted)]">选择后自动继续</span></div>
        <div className="h-2 border border-[var(--rule)] bg-white" aria-label={`进度 ${index + 1}/12`}><div className="h-full bg-[var(--accent)]" style={{ width: `${progress}%` }} /></div>
      </header>
      <section className="flex flex-1 flex-col justify-center py-3">
        <h1 className="m-0 text-[28px] font-black leading-tight tracking-[-.025em]">{question.prompt}</h1>
        <div className="mt-8 space-y-4">
          {question.options.map((option) => <button key={option.id} className="option" data-selected={answers[question.id] === option.id} onClick={() => choose(option.id)}>{option.text}</button>)}
        </div>
      </section>
      <button className="button secondary w-full" onClick={() => index === 0 ? router.push("/") : setIndex((value) => value - 1)}>返回上一题</button>
    </main>
  );
}
