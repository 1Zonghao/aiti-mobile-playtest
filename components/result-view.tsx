"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { disclaimersContent, questionsContent, resultTypeByCode, temptationLevelByNumber, temptationLevelsContent } from "../src/content";
import { orderedAnswers } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import { scoreAnswers } from "../src/scoring";

const plainResultExplanations: Record<string, string> = {
  V: "你更吃“先接住情绪”这一套。比起马上讲道理，你更希望AI先承认：这件事确实让你不好受。",
  F: "你更想先把事情弄清楚。安慰可以有，但AI最好把事实、猜测和建议分开说。",
  O: "你会在意“它是不是只对我这样”。专属感对你有用，复制粘贴式的温柔会让你下头。",
  P: "你不太想把全部情绪押在一个AI上。AI能帮就帮，朋友、家人或别的工具也可以一起上。",
  M: "你很在意它记不记得以前聊过什么。称呼、旧事和前后能不能连上，会明显影响你的感觉。",
  N: "你更看重这一次有没有帮上忙。以前聊过什么没那么重要，眼前这句话有用就行。",
  S: "出了问题，你通常愿意再聊一轮，看看能不能把关系和感觉修回来。",
  E: "一旦觉得不对劲，你更愿意停掉、换掉或删掉，不想被挽留的话拖住。"
};

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
  const resultExplanations = result.code.split("").map((code) => plainResultExplanations[code]);
  const gapExplanation = score.comfortReliabilityGap === 0
    ? "几组双选里，你觉得舒服的回复，也都是你觉得更靠谱的回复。这次你没有在“好听”和“可信”之间打架。"
    : `有 ${score.comfortReliabilityGap} 组双选里，你最想听的回复和你觉得最靠谱的回复不是同一个。简单说：你知道哪句更靠谱，但另一句更顺耳。`;

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
      </section>
      <section className="panel p-4">
        <h3 className="m-0 text-xl font-black">翻译成人话，就是：</h3>
        <div className="mt-3 space-y-3 text-[16px] leading-7">
          {resultExplanations.map((explanation) => <p className="m-0" key={explanation}>{explanation}</p>)}
        </div>
      </section>
      <section>
        <div className="border-l-[6px] border-[var(--accent)] bg-white p-4">
          <p className="label m-0">你有多吃AI这一套 · Lv.{level.level}</p>
          <p className="mb-0 mt-1 text-xl font-black">{level.name}</p>
          <p className="mb-0 mt-2 leading-7">{level.resultCopy}</p>
        </div>
        <div className="mt-4 bg-white p-4">
          <p className="m-0 font-black">“好听”和“靠谱”打架了 {score.comfortReliabilityGap} 次</p>
          <p className="mb-0 mt-2 leading-7">{gapExplanation}</p>
        </div>
      </section>
      <section className="space-y-3 text-[16px] leading-7">
        <p><strong>哪句话最容易戳中你：</strong>{result.fatalLine}</p>
        <p><strong>平台这样改，你最难受：</strong>{result.platformFear}</p>
        <p><strong>损你一句：</strong>{result.roast}</p>
        <p><strong>不过，还是提醒一句：</strong>{result.safetyNote ?? disclaimersContent.researchBoundary.resultMeaning}</p>
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
