import type { Metadata } from "next";
import { AnalyticsToggle } from "../../components/analytics-toggle";
import { SiteHeader } from "../../components/site-header";
import { APP_VERSION, CONTENT_VERSION, SCORING_VERSION } from "../../src/playtest";
import { disclaimersContent } from "../../src/content";

export const metadata: Metadata = { title: "项目与数据说明" };
export default function AboutPage() { return <main className="page-shell"><SiteHeader /><section className="mx-auto max-w-3xl py-12"><p className="eyebrow">ABOUT THE FILE</p><h1 className="section-title mt-4">一本不太正经的AI关系档案</h1><div className="mt-9 grid gap-6"><article className="paper-card p-6"><h2 className="text-2xl font-black">项目说明</h2><p className="leading-8">AITI 是面向大会现场的娱乐性学术传播互动，用12个虚构AI陪伴场景讨论情绪确认、现实校验、专属感、记忆连续性、退出安全与平台更新权力。</p></article><article className="paper-card p-6"><h2 className="text-2xl font-black">免责声明</h2><p className="leading-8">{disclaimersContent.unifiedDisclaimer}</p></article><article className="paper-card p-6"><h2 className="text-2xl font-black">隐私与数据</h2><p className="leading-8">测试进度与可选统计只保存在当前浏览器，不上传服务器。不采集姓名、手机号、微信身份、IP、设备指纹、精确位置或聊天记录。</p><AnalyticsToggle /></article><article className="paper-card p-6"><h2 className="text-2xl font-black">大会与作者信息</h2><p className="leading-8">大会名称、展位、论文海报与作者信息将在正式发布前补充。当前版本不伪造尚未提供的信息。</p><p className="label">CONTENT {CONTENT_VERSION} · SCORING {SCORING_VERSION} · APP {APP_VERSION}</p></article></div></section></main>; }
