"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { disclaimersContent, questionsContent, resultTypeByCode, temptationLevelByNumber, temptationLevelsContent } from "../src/content";
import { orderedAnswers } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import { scoreAnswers } from "../src/scoring";

export function ResultView() {
  const router = useRouter();
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const sessionId = usePlaytestStore((state) => state.anonymousSessionId);
  const answers = usePlaytestStore((state) => state.answers);
  const reset = usePlaytestStore((state) => state.reset);
  const start = usePlaytestStore((state) => state.start);
  const ordered = useMemo(() => orderedAnswers(questionsContent.questions.map((question) => question.id), answers), [answers]);
  const score = ordered.length === questionsContent.questions.length ? scoreAnswers(questionsContent.questions, ordered, temptationLevelsContent) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId) router.replace("/");
    else if (!score) router.replace(Object.keys(answers).length >= 11 ? "/update" : "/test");
  }, [answers, hydrated, router, score, sessionId]);

  if (!hydrated || !score) return <main className="screen"><p>正在生成结果…</p></main>;
  const result = resultTypeByCode.get(score.typeCode);
  const level = temptationLevelByNumber.get(score.temptationLevel);
  if (!result || !level) throw new Error("结果内容映射不完整。");
  const palette = result.palette.hex ?? ["#d9d4c8", "#171717", "#e85d35", "#fffdf7"];

  return (
    <main className="screen gap-5">
      <header className="flex items-end justify-between border-b-2 border-[var(--rule)] pb-3">
        <div><p className="label m-0">AITI TYPE</p><h1 className="m-0 text-[52px] font-black leading-none tracking-[-.06em]">{result.code}</h1></div>
        <p className="m-0 max-w-[8rem] text-right text-sm font-bold">{result.name}</p>
      </header>
      <section className="panel grid min-h-48 place-items-center overflow-hidden p-6" aria-label="纯色几何占位角色" style={{ background: palette[3] }}>
        <div className="relative h-36 w-36">
          <div className="absolute left-7 top-0 h-24 w-24 rotate-6 rounded-[36%] border-4 border-[var(--rule)]" style={{ background: palette[0] }} />
          <div className="absolute bottom-0 left-2 h-16 w-32 -rotate-3 rounded-[48%_48%_20%_20%] border-4 border-[var(--rule)]" style={{ background: palette[1] }} />
          <div className="absolute right-0 top-16 h-11 w-11 rotate-45 border-4 border-[var(--rule)]" style={{ background: palette[2] }} />
        </div>
      </section>
      <section>
        <h2 className="m-0 text-[30px] font-black leading-tight">{result.name}</h2>
        <p className="mt-2 text-lg leading-7">{result.definition}</p>
        <div className="mt-4 border-l-[6px] border-[var(--accent)] bg-white p-4"><p className="label m-0">哄感等级 Lv.{level.level}</p><p className="mb-0 mt-1 text-xl font-black">{level.name}</p></div>
        <p className="mt-4 font-bold">舒服—可靠背离：{score.comfortReliabilityGap} 次</p>
      </section>
      <section className="space-y-3 text-[16px] leading-7">
        <p><strong>致命台词：</strong>{result.fatalLine}</p>
        <p><strong>最怕平台变化：</strong>{result.platformFear}</p>
        <p><strong>毒舌总结：</strong>{result.roast}</p>
        <p><strong>安全彩蛋：</strong>{result.safetyNote ?? disclaimersContent.researchBoundary.resultMeaning}</p>
      </section>
      <aside className="border-t-2 border-[var(--rule)] pt-4 text-sm leading-6">
        这不是人格诊断，也不预测真实心理依赖，只描述你在本次虚构互动中的选择路径。
      </aside>
      <div className="grid gap-3">
        <Link className="button" href="/feedback">填写试玩反馈</Link>
        <button className="button secondary" onClick={() => { reset(); start(); router.push("/test"); }}>清除旧状态并重新测试</button>
      </div>
    </main>
  );
}
