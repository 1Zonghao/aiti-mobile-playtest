"use client";

import { useRef, useState } from "react";
import { CharacterVisual } from "./character-visual";
import { getSiteConfig } from "../src/site";
import type { ResultType, TemptationLevelDefinition } from "../src/types";

type ShareStatus = "idle" | "working" | "saved" | "failed";

async function waitForImages(node: HTMLElement): Promise<void> {
  await Promise.all(Array.from(node.querySelectorAll("img")).map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const finish = () => resolve();
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      window.setTimeout(finish, 2500);
    });
  }));
}

export function ShareCard({ result, shadowResult, level }: { result: ResultType; shadowResult: ResultType | undefined; level: TemptationLevelDefinition }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [screenshotMode, setScreenshotMode] = useState(false);
  const site = getSiteConfig(process.env.NEXT_PUBLIC_SITE_URL);
  const isWeChat = typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);

  async function saveCard() {
    const node = cardRef.current;
    if (!node || status === "working") return;
    setStatus("working");
    try {
      await document.fonts.ready;
      await waitForImages(node);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, { canvasWidth: 1080, canvasHeight: 1440, pixelRatio: 1, cacheBust: true, backgroundColor: "#fffdf7" });
      const anchor = document.createElement("a");
      anchor.download = `AITI-${result.code}-${result.name}.png`;
      anchor.href = dataUrl;
      anchor.click();
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  }

  return <section className={screenshotMode ? "share-zone screenshot-mode" : "share-zone"} aria-labelledby="share-title">
    <div className="share-card" ref={cardRef} data-testid="share-card">
      <header className="share-card-head"><span>AITI · CONFERENCE EDITION</span><strong>{result.code}</strong></header>
      <div className="share-character"><CharacterVisual result={result} priority /></div>
      <div className="share-copy">
        <p className="share-level">哄感 Lv.{level.level} · {level.name}</p>
        <h2 id="share-title">{result.name}</h2>
        <p className="share-roast">{result.roast}</p>
        <p className="share-shadow">影子类型：{shadowResult ? `${shadowResult.code} · ${shadowResult.name}` : "—"}</p>
      </div>
      <footer className="share-card-foot">
        <div>{site.status === "available" ? <a href={site.url} target="_blank" rel="noopener noreferrer"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(site.url)}`} alt="网站二维码" width={74} height={74} style={{ display: "block" }} /><span>{site.url}</span></a> : <span>扫码地址待现场配置</span>}</div>
        <strong>本结果仅供娱乐</strong>
      </footer>
    </div>
    <div className="share-actions no-print">
      <button className="button" type="button" onClick={saveCard} disabled={status === "working"}>{status === "working" ? "正在生成…" : "保存结果图"}</button>
      <button className="button secondary" type="button" onClick={() => setScreenshotMode((value) => !value)}>{screenshotMode ? "退出截图模式" : "普通截图友好模式"}</button>
    </div>
    {(isWeChat || status === "failed") && <p className="share-fallback" role="status">{status === "failed" ? "结果图生成失败，不影响结果阅读。" : "微信内置浏览器可能无法直接下载。"}请长按结果卡或使用系统截图保存。</p>}
    {status === "saved" && <p className="share-fallback" role="status">结果图已生成；若没有出现下载，请长按或使用系统截图保存。</p>}
  </section>;
}
