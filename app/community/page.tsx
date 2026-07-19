"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { useCommunityStore } from "../../src/community-store";
import { resultTypeByCode, temptationLevelByNumber } from "../../src/content";

export default function CommunityPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const history = useCommunityStore((state) => state.history);
  const comments = useCommunityStore((state) => state.comments);
  const addComment = useCommunityStore((state) => state.addComment);
  const clearHistory = useCommunityStore((state) => state.clearHistory);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!hydrated) return <main className="screen"><p>正在加载社区数据…</p></main>;

  function submit() {
    const trimmed = message.trim();
    if (!trimmed) return;
    const latest = history[0];
    addComment({ nickname: nickname.trim() || "匿名用户", message: trimmed, resultType: latest?.typeCode ?? null, temptationLevel: latest?.temptationLevel ?? null });
    setMessage(""); setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-3xl py-12">
        <p className="eyebrow">COMMUNITY WALL</p>
        <h1 className="section-title mt-4">测试记录 & 社区留言板</h1>
        <p className="max-w-2xl text-lg leading-8">
          你的测试历史会保存在当前设备的浏览器中。社区留言对使用同一设备的所有用户可见。
        </p>

        {/* History Section */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">我的测试记录</h2>
            {history.length > 0 && <button className="text-link text-sm" onClick={() => { if (window.confirm("确定要清除所有测试记录？")) clearHistory(); }}>清除记录</button>}
          </div>
          {history.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="m-0 text-xl font-black">还没有测试记录</p>
              <Link className="button mt-4 inline-block" href="/test">开始第一次测试</Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {history.map((entry, index) => {
                const result = resultTypeByCode.get(entry.typeCode);
                const level = temptationLevelByNumber.get(entry.temptationLevel);
                return (
                  <div className="panel flex flex-wrap items-center gap-4 p-4" key={index}>
                    <Link href={`/types/${entry.typeCode.toLowerCase()}`} className="no-underline">
                      <strong className="text-lg">{entry.typeCode}</strong>
                    </Link>
                    <span className="font-bold">{result?.name}</span>
                    <span className="label">Lv.{entry.temptationLevel} {level?.name}</span>
                    <span className="label">背离 {entry.comfortReliabilityGap} 次</span>
                    <span className="ml-auto text-sm text-[var(--muted)]">
                      {new Date(entry.timestamp).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Comment Wall */}
        <section className="mt-14">
          <h2 className="text-2xl font-black">社区留言板</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            留言保存在当前设备中，同一设备的所有用户均可见。大会现场可固定一台设备供大家留言。
          </p>

          {/* Submit Form */}
          <div className="panel mt-5 grid gap-3 p-5">
            <input
              className="w-full border-b-2 border-[var(--rule)] px-2 py-3 text-lg font-bold outline-none"
              placeholder="你的名字（选填）"
              value={nickname}
              maxLength={12}
              onChange={(e) => setNickname(e.target.value)}
            />
            <textarea
              className="w-full border-b-2 border-[var(--rule)] px-2 py-3 text-lg outline-none resize-none"
              placeholder="说点什么…你的测试结果、感受、或者对AI陪伴的吐槽都行"
              rows={3}
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            />
            <div className="flex items-center gap-4">
              <button className="button" onClick={submit} disabled={!message.trim()}>
                {submitted ? "已发送 ✓" : "发布留言"}
              </button>
              <span className="text-sm text-[var(--muted)]">{message.length}/300</span>
            </div>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="panel mt-5 p-8 text-center">
              <p className="m-0 text-lg font-bold text-[var(--muted)]">还没有留言，来做第一个留言的人吧！</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {comments.map((comment) => {
                const result = comment.resultType ? resultTypeByCode.get(comment.resultType) : null;
                const level = comment.temptationLevel !== null ? temptationLevelByNumber.get(comment.temptationLevel) : null;
                return (
                  <div className="panel p-4" key={comment.id}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <strong>{comment.nickname}</strong>
                      {result && (
                        <Link href={`/types/${result.code.toLowerCase()}`} className="label no-underline hover:underline">
                          {result.code} · {result.name}
                        </Link>
                      )}
                      {level && <span className="label">Lv.{level.level} {level.name}</span>}
                      <span className="ml-auto text-xs text-[var(--muted)]">
                        {new Date(comment.timestamp).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="m-0 leading-7">{comment.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link className="text-link" href="/test">再做一次测试</Link>
          <Link className="text-link" href="/types">浏览16型</Link>
          <Link className="text-link" href="/">返回首页</Link>
        </div>
      </section>
    </main>
  );
}
