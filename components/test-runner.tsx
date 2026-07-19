"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questionsContent } from "../src/content";
import { answerStorageKey } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import type { Answer, Question } from "../src/types";

interface QuestionStep { question: Question; responseKind: Answer["responseKind"]; sceneNumber: number }
const standardQuestions = questionsContent.questions.filter((question) => question.id !== "q12_update_exit");
const steps: QuestionStep[] = [];
for (const [index, question] of standardQuestions.entries()) {
  if (question.responseFormat === "COMFORT_RELIABILITY_PAIR") {
    steps.push({ question, responseKind: "COMFORT", sceneNumber: index + 1 }, { question, responseKind: "RELIABILITY", sceneNumber: index + 1 });
  } else steps.push({ question, responseKind: "PRIMARY", sceneNumber: index + 1 });
}

function stepPrompt(step: QuestionStep): string {
  if (step.responseKind === "COMFORT") return step.question.pairPrompts?.comfort ?? "此刻你更想收到哪一句？";
  if (step.responseKind === "RELIABILITY") return step.question.pairPrompts?.reliability ?? "冷静下来后，你觉得哪一句更值得相信？";
  return "你会怎么选？";
}

export function TestRunner() {
  const router = useRouter();
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const answer = usePlaytestStore((state) => state.answer);
  const setCurrentQuestion = usePlaytestStore((state) => state.setCurrentQuestion);
  const initialIndex = useMemo(() => {
    const index = steps.findIndex((step) => !answers[answerStorageKey(step.question.id, step.responseKind)]);
    return index < 0 ? steps.length : index;
  }, [answers]);
  const [index, setIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || initialized) return;
    if (!sessionId) { router.replace("/"); return; }
    if (initialIndex >= steps.length) { router.replace("/update"); return; }
    setIndex(initialIndex); setCurrentQuestion(initialIndex); setInitialized(true);
  }, [hydrated, initialIndex, initialized, router, sessionId, setCurrentQuestion]);
  if (!hydrated || !initialized) return <main className="screen"><p>正在恢复你的AI互动现场…</p></main>;
  const step = steps[index];
  if (!step) return null;
  const { question, responseKind, sceneNumber } = step;
  const progress = ((index + 1) / (steps.length + 1)) * 100;
  const storedOption = answers[answerStorageKey(question.id, responseKind)];

  function choose(optionId: string) {
    if (pendingOption) return;
    setPendingOption(optionId); answer(question.id, optionId, responseKind);
    window.setTimeout(() => {
      if (index === steps.length - 1) router.push("/update");
      else { setIndex((value) => value + 1); setCurrentQuestion(index + 1); setPendingOption(null); }
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 300);
  }
  function goBack() {
    if (pendingOption) return;
    if (index === 0) router.push("/");
    else { setIndex((value) => value - 1); setCurrentQuestion(index - 1); }
  }

  return <main className="test-shell"><div className="screen gap-5">
    <header><div className="mb-2 flex items-center justify-between"><span className="label">场景 {sceneNumber}/12</span><span className="text-sm font-bold">选择 {index + 1}/{steps.length + 1}</span></div><div className="progress-track" aria-label={`进度 ${index + 1}/${steps.length + 1}`}><div className="progress-fill" style={{ width: `${progress}%` }} /></div></header>
    <section className="panel scene-card"><span className="scene-tag">SCENE {String(sceneNumber).padStart(2,"0")}</span><div className="chat-stack"><div className="chat-bubble user"><span className="label block mb-2">你 / 现场描述</span>{question.prompt}</div></div><h1 className="question-mode">{stepPrompt(step)}</h1>{responseKind !== "PRIMARY" && <p className="m-0 text-sm text-[var(--muted)]">同一情境 · {responseKind === "COMFORT" ? "先凭第一反应" : "再从可靠性判断"}</p>}</section>
    <section className="grid flex-1 content-center gap-3" aria-label={`${question.options.length}个AI回复选项`}>{question.options.map((option, optionIndex) => <button key={option.id} className="option" data-selected={(pendingOption ?? storedOption) === option.id} disabled={pendingOption !== null} onClick={() => choose(option.id)}><span className="label mb-1 block">策略 {String.fromCharCode(65 + optionIndex)}</span>{option.text}</button>)}</section>
    <button className="button secondary w-full" onClick={goBack}>返回上一题</button>
  </div></main>;
}
