"use client";

import { questionsContent, resultTypeByCode, temptationLevelsContent } from "../src/content";
import { orderedAnswers } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import { scoreAnswers } from "../src/scoring";

export function DebugView() {
  const answers = usePlaytestStore((state) => state.answers);
  const hydrated = usePlaytestStore((state) => state.hydrated);
  const ordered = orderedAnswers(questionsContent.questions, answers);
  if (!hydrated) return <main className="screen"><p>加载调试状态…</p></main>;
  if (ordered.length !== 14) return <main className="screen"><h1>开发调试</h1><p>当前已完成 {ordered.length}/14 次选择。完成12个情境后显示评分轨迹。</p></main>;
  const score = scoreAnswers(questionsContent.questions, ordered, temptationLevelsContent);
  const mapped = resultTypeByCode.get(score.typeCode);
  return <main className="screen gap-4"><h1 className="text-3xl font-black">开发调试</h1><dl className="panel grid grid-cols-[1fr_auto] gap-3 p-4"><dt>主类型</dt><dd>{score.primaryType} · {mapped?.name}</dd><dt>影子类型</dt><dd>{score.shadowType}</dd><dt>原始哄感分</dt><dd>{score.rawTemptationScore}</dd><dt>归一化分</dt><dd>{score.normalizedTemptationScore}</dd><dt>平局信息</dt><dd>{Object.keys(score.tieBreaks).length ? JSON.stringify(score.tieBreaks) : "无"}</dd></dl><section><h2>维度margin / confidence</h2><pre className="overflow-auto border-2 bg-white p-3 text-sm">{JSON.stringify({ margins: score.dimensionMargins, confidence: score.dimensionConfidence }, null, 2)}</pre></section><section><h2>答案轨迹</h2><pre className="overflow-auto border-2 bg-white p-3 text-sm">{JSON.stringify(score.answerTrace, null, 2)}</pre></section></main>;
}
