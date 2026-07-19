"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questionsContent, temptationLevelsContent } from "../src/content";
import { completionTimeSeconds, createPlaytestRecord, orderedAnswers, recordsToCsv } from "../src/playtest";
import type { PlaytestFeedback, YesNo } from "../src/playtest";
import { usePlaytestStore } from "../src/playtest-store";
import { scoreAnswers } from "../src/scoring";

function download(filename: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function QuestionChecklist({ name, value, onChange }: { name: string; value: string[]; onChange: (next: string[]) => void }) {
  return <div className="grid grid-cols-2 gap-x-3">{questionsContent.questions.map((question, index) => <label className="checkline" key={question.id}><input type="checkbox" name={name} value={question.id} checked={value.includes(question.id)} onChange={(event) => onChange(event.target.checked ? [...value, question.id] : value.filter((id) => id !== question.id))} />q{String(index + 1).padStart(2, "0")}</label>)}</div>;
}

function YesNoField({ legend, name, value, onChange }: { legend: string; name: string; value: YesNo; onChange: (value: YesNo) => void }) {
  return <fieldset><legend className="font-bold">{legend}</legend><div className="mt-2 flex gap-6">{(["yes", "no"] as const).map((item) => <label className="checkline" key={item}><input type="radio" name={name} checked={value === item} onChange={() => onChange(item)} />{item === "yes" ? "愿意" : "不愿意"}</label>)}</div></fieldset>;
}

export function FeedbackForm() {
  const router = useRouter();
  const store = usePlaytestStore();
  const answers = useMemo(() => orderedAnswers(questionsContent.questions, store.answers), [store.answers]);
  const score = answers.length === 14 ? scoreAnswers(questionsContent.questions, answers, temptationLevelsContent) : null;
  const [hardestQuestionId, setHardestQuestionId] = useState(questionsContent.questions[0]?.id ?? "");
  const [safe, setSafe] = useState<string[]>([]);
  const [unrealistic, setUnrealistic] = useState<string[]>([]);
  const [accuracy, setAccuracy] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [offensiveness, setOffensiveness] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [screenshot, setScreenshot] = useState<YesNo>("no");
  const [research, setResearch] = useState<YesNo>("no");
  const [vote, setVote] = useState<YesNo>("no");
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (store.hydrated && (!score || !store.anonymousSessionId)) router.replace("/");
  }, [router, score, store.anonymousSessionId, store.hydrated]);

  if (!store.hydrated) return <main className="screen"><p>正在恢复试玩记录…</p></main>;
  if (!score || !store.anonymousSessionId) return <main className="screen"><p>正在返回首页…</p></main>;
  const time = completionTimeSeconds(store.startedAt, store.completedAt);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!score) return;
    const feedback: PlaytestFeedback = {
      completionTimeSeconds: time,
      resultType: score.typeCode,
      temptationLevel: score.temptationLevel,
      comfortReliabilityGap: score.comfortReliabilityGap,
      hardestQuestionId,
      obviousSafeAnswerQuestionIds: safe,
      unrealisticOptionQuestionIds: unrealistic,
      resultAccuracyRating: accuracy,
      offensivenessRating: offensiveness,
      willingToScreenshot: screenshot,
      willingToReadResearch: research,
      willingToVote: vote,
      optionalComment: comment
    };
    store.saveFeedback(createPlaytestRecord(store, score, feedback));
    setSaved(true);
  }

  return (
    <main className="screen gap-6">
      <header><p className="label m-0">LOCAL PLAYTEST FEEDBACK</p><h1 className="mb-2 mt-2 text-[34px] font-black">试玩反馈</h1><p className="m-0 leading-7">只保存在这台设备，提交不会上传。实际用时：{time} 秒。</p></header>
      <form className="space-y-7" onSubmit={submit}>
        <label className="block font-bold">哪道题最难选？<select className="field mt-2" value={hardestQuestionId} onChange={(event) => setHardestQuestionId(event.target.value)}>{questionsContent.questions.map((question, index) => <option key={question.id} value={question.id}>q{String(index + 1).padStart(2, "0")} · {question.id}</option>)}</select></label>
        <fieldset><legend className="font-bold">哪些题一眼看出“安全答案”？</legend><QuestionChecklist name="safeQuestions" value={safe} onChange={setSafe} /></fieldset>
        <fieldset><legend className="font-bold">哪些题有不像真人会选的选项？</legend><QuestionChecklist name="unrealisticQuestions" value={unrealistic} onChange={setUnrealistic} /></fieldset>
        <fieldset><legend className="font-bold">结果被说中的程度（1—5）</legend><div className="mt-2 flex justify-between">{([1,2,3,4,5] as const).map((item) => <label className="checkline" key={item}><input type="radio" name="accuracy" checked={accuracy === item} onChange={() => setAccuracy(item)} />{item}</label>)}</div></fieldset>
        <fieldset><legend className="font-bold">结果冒犯程度（1—5）</legend><div className="mt-2 flex justify-between">{([1,2,3,4,5] as const).map((item) => <label className="checkline" key={item}><input type="radio" name="offensiveness" checked={offensiveness === item} onChange={() => setOffensiveness(item)} />{item}</label>)}</div></fieldset>
        <YesNoField legend="愿意截图分享？" name="screenshot" value={screenshot} onChange={setScreenshot} />
        <YesNoField legend="愿意了解研究？" name="research" value={research} onChange={setResearch} />
        <YesNoField legend="愿意为研究投票？" name="vote" value={vote} onChange={setVote} />
        <label className="block font-bold">自由反馈（仅进入本地导出文件）<textarea className="field mt-2 min-h-28" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} /></label>
        <button className="button w-full" type="submit">保存到本机</button>
      </form>
      {saved && <section className="panel p-4" role="status"><p className="mt-0 font-bold">已保存。当前设备共有 {store.feedbackRecords.length} 条记录。</p><div className="grid gap-3"><button className="button secondary" onClick={() => download("playtest-results.json", JSON.stringify(store.feedbackRecords, null, 2), "application/json")}>导出 playtest-results.json</button><button className="button secondary" onClick={() => download("playtest-results.csv", recordsToCsv(store.feedbackRecords), "text/csv;charset=utf-8")}>导出 playtest-results.csv</button></div></section>}
      <button className="button secondary" onClick={() => router.push("/result")}>返回结果</button>
      <p className="text-sm leading-6 text-[var(--muted)]">不采集姓名、手机号、微信身份、设备指纹、IP 或精确位置。</p>
    </main>
  );
}
