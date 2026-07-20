"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteHeader } from "../../components/site-header";
import { addComment, getComments } from "../../src/cloudbase";
import type { CommentItem } from "../../src/cloudbase";
import { useCommunityStore } from "../../src/community-store";
import { resultTypeByCode, temptationLevelByNumber } from "../../src/content";

const NICK_MAX = 20;
const CONTENT_MAX = 200;
const PAGE_LIMIT = 30;

function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function CommunityPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // history from localStorage
  const history = useCommunityStore((state) => state.history);
  const clearHistory = useCommunityStore((state) => state.clearHistory);

  // CloudBase comments
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(PAGE_LIMIT);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载留言失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (hydrated) loadComments(); }, [hydrated, loadComments]);

  // Submit state
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  const trimmedNick = nickname.trim();
  const trimmedContent = content.trim();
  const canSubmit =
    trimmedNick.length >= 1 &&
    trimmedNick.length <= NICK_MAX &&
    trimmedContent.length >= 1 &&
    trimmedContent.length <= CONTENT_MAX &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await addComment({
        nickname: trimmedNick,
        content: trimmedContent,
      });
      if (result) {
        // Prepend server-confirmed comment
        setComments((prev) => [result, ...prev]);
        setNickname("");
        setContent("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
      } else {
        throw new Error("发布失败，请稍后重试");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (!hydrated) {
    return (
      <main className="screen">
        <p>正在加载社区数据…</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="mx-auto max-w-3xl py-12">
        <p className="eyebrow">COMMUNITY WALL</p>
        <h1 className="section-title mt-4">测试记录 & 社区留言板</h1>
        <p className="max-w-2xl text-lg leading-8">
          留言实时同步到云端，所有用户都能看到。你的测试历史保存在当前设备中。
        </p>

        {/* ── History ─────────────────────────────── */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">我的测试记录</h2>
            {history.length > 0 && (
              <button
                className="text-link text-sm"
                onClick={() => {
                  if (window.confirm("确定要清除所有测试记录？")) clearHistory();
                }}
              >
                清除记录
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="m-0 text-xl font-black">还没有测试记录</p>
              <Link className="button mt-4 inline-block" href="/test">
                开始第一次测试
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {history.map((entry, index) => {
                const r = resultTypeByCode.get(entry.typeCode);
                const lv = temptationLevelByNumber.get(entry.temptationLevel);
                return (
                  <div className="panel flex flex-wrap items-center gap-4 p-4" key={index}>
                    <Link href={`/types/${entry.typeCode.toLowerCase()}`} className="no-underline">
                      <strong className="text-lg">{entry.typeCode}</strong>
                    </Link>
                    <span className="font-bold">{r?.name}</span>
                    <span className="label">Lv.{entry.temptationLevel} {lv?.name}</span>
                    <span className="label">背离 {entry.comfortReliabilityGap} 次</span>
                    <span className="ml-auto text-sm text-[var(--muted)]">
                      {entry.timestamp ? formatTime(entry.timestamp) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Comments ────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-black">社区留言板</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">
            留言实时同步，所有用户均可看到。
          </p>

          {/* Submit form */}
          <div className="panel mt-5 grid gap-3 p-5">
            <div>
              <input
                className="w-full border-b-2 border-[var(--rule)] px-2 py-3 text-lg font-bold outline-none"
                placeholder={`你的名字（1-${NICK_MAX}字）`}
                value={nickname}
                maxLength={NICK_MAX}
                onChange={(e) => setNickname(e.target.value)}
              />
              <span className="text-xs text-[var(--muted)]">{trimmedNick.length}/{NICK_MAX}</span>
            </div>
            <div>
              <textarea
                className="w-full border-b-2 border-[var(--rule)] px-2 py-3 text-lg outline-none resize-none"
                placeholder="说点什么…"
                rows={3}
                maxLength={CONTENT_MAX}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <span className="text-xs text-[var(--muted)]">{trimmedContent.length}/{CONTENT_MAX}</span>
            </div>

            {submitError && (
              <p className="m-0 text-sm font-bold text-[var(--warning)]">{submitError}</p>
            )}

            <div className="flex items-center gap-4">
              <button className="button" onClick={handleSubmit} disabled={!canSubmit}>
                {submitted ? "已发布 ✓" : submitting ? "发布中…" : "发布留言"}
              </button>
            </div>
          </div>

          {/* Comment list */}
          {loading ? (
            <div className="panel mt-5 p-8 text-center">
              <p className="m-0 text-lg font-bold text-[var(--muted)]">正在加载留言…</p>
            </div>
          ) : error ? (
            <div className="panel mt-5 p-8 text-center">
              <p className="m-0 font-bold text-[var(--warning)]">{error}</p>
              <button className="text-link mt-3" onClick={loadComments}>点击重试</button>
            </div>
          ) : comments.length === 0 ? (
            <div className="panel mt-5 p-8 text-center">
              <p className="m-0 text-lg font-bold text-[var(--muted)]">
                还没有留言，来做第一个留言的人吧！
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {comments.map((comment) => (
                <div className="panel p-4" key={comment.id}>
                  <div className="mb-2 flex items-center gap-3">
                    <strong>{comment.nickname}</strong>
                    <span className="ml-auto text-xs text-[var(--muted)]">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="m-0 leading-7">{comment.content}</p>
                </div>
              ))}
              <button className="text-link mx-auto" onClick={loadComments}>
                刷新留言
              </button>
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
