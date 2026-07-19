"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterVisual } from "./character-visual";
import { VoteLink } from "./vote-link";
import { disclaimersContent, questionsContent, resultTypeByCode, temptationLevelByNumber, temptationLevelsContent } from "../src/content";
import { orderedAnswers } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import { scoreAnswers } from "../src/scoring";

const conceptNames: Record<string,string> = { V: "情绪确认", F: "现实校验", O: "专属关系", P: "多源支持", M: "记忆连续性", N: "当下有用", S: "留下修复", E: "自主退出" };

export function ResultView() {
  const router = useRouter();
  const [shareHint, setShareHint] = useState(false);
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const reset = usePlaytestStore((state) => state.reset);
  const start = usePlaytestStore((state) => state.start);
  const track = usePlaytestStore((state) => state.track);
  const ordered = useMemo(() => orderedAnswers(questionsContent.questions.map((question) => question.id), answers), [answers]);
  const score = ordered.length === questionsContent.questions.length ? scoreAnswers(questionsContent.questions, ordered, temptationLevelsContent) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) router.replace("/");
    else if (!score) router.replace(Object.keys(answers).length >= 11 ? "/update" : "/test");
  }, [answers, hydrated, router, score, sessionId]);
  if (!hydrated || !score) return <main className="screen"><p>正在装订你的AITI人格档案…</p></main>;
  const result = resultTypeByCode.get(score.typeCode);
  const level = temptationLevelByNumber.get(score.temptationLevel);
  if (!result || !level) throw new Error("结果内容映射不完整。");
  const concepts = result.code.split("").map((code) => conceptNames[code]).join(" · ");
  const gapCopy = score.comfortReliabilityGap === 0 ? "这次没有出现“好听”和“可信”分开选择。" : `你有${score.comfortReliabilityGap}次知道哪句话更可靠，却仍然选择了更舒服的回复。`;

  return (
    <main>
      <article className="result-sheet" aria-label={`${result.code} ${result.name}结果档案`}>
        <section className="result-block min-h-[100dvh] flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4"><p className="eyebrow">AITI TYPE</p><span className="label">本结果不负责，只负责说中</span></div>
          <h1 className="result-code">{result.code}</h1>
          <div className="my-7"><CharacterVisual result={result} priority /></div>
          <p className="level-stamp">哄感 Lv.{level.level} · {level.name}</p>
          <h2 className="result-name">{result.name}</h2>
          {result.resultTitle && <p className="text-xl font-black">{result.resultTitle}</p>}
          <p className="result-definition">{result.definition}</p>
        </section>
        <section className="result-block min-h-[100dvh] flex flex-col justify-center">
          <p className="eyebrow">命中报告 / HIT REPORT</p>
          <h2 className="section-title mt-4">你的电子死穴</h2>
          <dl className="result-facts mt-8">
            <div className="fact-card"><dt>致命AI台词</dt><dd>“{result.fatalLine}”</dd></div>
            <div className="fact-card"><dt>平台更新暴击</dt><dd>{result.platformFear}</dd></div>
            <div className="fact-card"><dt>舒服—可靠背离</dt><dd>{gapCopy}</dd></div>
            <div className="fact-card"><dt>毒舌判词</dt><dd>{result.roast}</dd></div>
          </dl>
          <div className="panel mt-7 p-5"><p className="label">哄感等级说明</p><p className="text-xl font-black">Lv.{level.level} {level.name}</p><p className="leading-7">{level.resultCopy}</p><p className="text-sm leading-6 text-[var(--muted)]">{level.warningCopy}</p></div>
        </section>
        <section className="result-block min-h-[80dvh] flex flex-col justify-center">
          <p className="eyebrow">安全彩蛋 / SAFETY NOTE</p>
          <h2 className="section-title mt-4">它为什么这么准？</h2>
          <p className="mt-7 text-xl font-bold leading-8">你刚才不是在选“正确答案”，而是在不同AI陪伴策略里暴露了更容易奏效的那一套。</p>
          <div className="paper-card mt-6 p-5"><p className="label">对应研究概念</p><p className="text-lg font-black">{concepts}</p><p className="leading-7">{result.safetyNote ?? disclaimersContent.researchBoundary.resultMeaning}</p></div>
          <p className="mt-7 border-t-2 border-[var(--rule)] pt-5 text-sm leading-7">{disclaimersContent.unifiedDisclaimer}</p>
        </section>
      </article>
      <section className="no-print screen min-h-0 gap-3 pt-0">
        <button className="button" onClick={() => setShareHint((value) => !value)}>保存 / 分享结果</button>
        {shareHint && <div className="panel p-4" role="status"><p className="m-0 leading-7">当前页面已按长截图排版。用浏览器截图，或选择“打印 / 存为PDF”。正式分享卡将在 Phase 3 完成。</p><button className="text-link" onClick={() => window.print()}>打印 / 存为PDF</button></div>}
        <button className="button secondary" onClick={() => { reset(); start(); router.push("/test"); }}>再测一次</button>
        <Link className="button secondary" href="/types">看看其他16型</Link>
        <Link className="button secondary" href="/research" onClick={() => track("research")}>查看研究</Link>
        <VoteLink className="button warning" />
        <p className="text-center font-bold">觉得这个问题值得被研究？为它投一票。</p>
        <Link className="text-link text-center" href="/feedback">填写本地试玩反馈</Link>
      </section>
    </main>
  );
}
