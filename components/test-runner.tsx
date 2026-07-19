"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questionsContent } from "../src/content";
import { usePlaytestStore } from "../src/playtest-store";

const standardQuestions = questionsContent.questions.filter((question) => question.id !== "q12_update_exit");
const modeCopy = { COMFORT: "此刻你更想收到哪一句？", RELIABILITY: "冷静下来后，你觉得哪一句更值得相信？", STANDARD: "你会怎么选？" } as const;

export function TestRunner() {
  const router = useRouter();
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const answer = usePlaytestStore((state) => state.answer);
  const setCurrentQuestion = usePlaytestStore((state) => state.setCurrentQuestion);
  const initialIndex = useMemo(() => {
    const index = standardQuestions.findIndex((question) => !answers[question.id]);
    return index < 0 ? standardQuestions.length : index;
  }, [answers]);
  const [index, setIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || initialized) return;
    if (!sessionId) { router.replace("/"); return; }
    if (initialIndex >= standardQuestions.length) { router.replace("/update"); return; }
    setIndex(initialIndex);
    setCurrentQuestion(initialIndex);
    setInitialized(true);
  }, [hydrated, initialIndex, initialized, router, sessionId, setCurrentQuestion]);

  if (!hydrated || !initialized) return <main className="screen"><p>正在恢复你的AI互动现场…</p></main>;
  const question = standardQuestions[index];
  if (!question) return null;
  const questionId = question.id;
  const progress = ((index + 1) / questionsContent.questions.length) * 100;

  function choose(optionId: string) {
    if (pendingOption) return;
    setPendingOption(optionId);
    answer(questionId, optionId);
    window.setTimeout(() => {
      if (index === standardQuestions.length - 1) router.push("/update");
      else {
        setIndex((value) => value + 1);
        setCurrentQuestion(index + 1);
        setPendingOption(null);
      }
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 300);
  }

  function goBack() {
    if (pendingOption) return;
    if (index === 0) router.push("/");
    else { setIndex((value) => value - 1); setCurrentQuestion(index - 1); }
  }

  return (
    <main className="test-shell">
      <div className="screen gap-5">
        <header>
          <div className="mb-2 flex items-center justify-between"><span className="label">问题 {index + 1}/12</span><span className="text-sm font-bold">AI互动档案 · {String(index + 1).padStart(2,"0")}</span></div>
          <div className="progress-track" aria-label={`进度 ${index + 1}/12`}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </header>
        <section className="panel scene-card">
          <span className="scene-tag">SCENE {String(index + 1).padStart(2,"0")}</span>
          <div className="chat-stack"><div className="chat-bubble user"><span className="label block mb-2">你 / 现场描述</span>{question.prompt}</div></div>
          <h1 className="question-mode">{modeCopy[question.responseKind]}</h1>
        </section>
        <section className="grid flex-1 content-center gap-4" aria-label="AI回复选项">
          {question.options.map((option, optionIndex) => <button key={option.id} className="option" data-selected={(pendingOption ?? answers[question.id]) === option.id} disabled={pendingOption !== null} onClick={() => choose(option.id)}><span className="label mb-1 block">AI 回复 {optionIndex === 0 ? "A" : "B"}</span>{option.text}</button>)}
        </section>
        <button className="button secondary w-full" onClick={goBack}>返回上一题</button>
      </div>
    </main>
  );
}
