import type { Metadata } from "next";
import Link from "next/link";
import { CharacterVisual } from "../../components/character-visual";
import { DemoResetButton } from "../../components/demo-reset-button";
import { SiteHeader } from "../../components/site-header";
import { VoteLink } from "../../components/vote-link";
import { resultTypesContent } from "../../src/content";

export const metadata: Metadata = { title: "大会演示模式" };
const entries = [
  ["01", "开始完整测试", "12道完整AI互动场景", "/test"],
  ["02", "查看8个爆款人格", "直接预览指定结果，不写入测试状态", "#featured"],
  ["03", "体验平台更新事件", "播放更新冲击，不读取测试状态", "/demo/update"],
  ["04", "查看研究核心问题", "用普通话解释研究边界与平台权力", "/research"]
] as const;

export default function DemoPage() {
  const featured = resultTypesContent.types.filter((type) => type.featured).sort((a, b) => a.priority - b.priority);
  return <main className="page-shell"><SiteHeader /><section className="py-12">
    <p className="demo-badge">演示预览 · 不保存为测试结果</p>
    <h1 className="section-title mt-4">大会演示模式</h1>
    <p className="max-w-2xl text-lg leading-8">四个入口可快速返回。除“开始完整测试”外，演示不会读取或修改普通用户的测试状态。</p>
    <div className="research-grid mt-9">{entries.map(([num, title, copy, href]) => <Link className="research-card panel no-underline" href={href} key={num}><strong>{num}</strong><h2 className="text-2xl font-black">{title}</h2><p className="leading-7">{copy}</p><span className="font-black">打开 →</span></Link>)}</div>
    <section className="mt-14" id="featured"><p className="eyebrow">8 FEATURED TYPES</p><h2 className="text-3xl font-black">指定人格快速预览</h2><div className="demo-types">{featured.map((type, index) => <Link href={`/demo/types/${type.code.toLowerCase()}`} className="demo-type-card panel" key={type.code}><CharacterVisual result={type} compact priority={index === 0} /><strong>{type.code} · {type.name}</strong></Link>)}</div></section>
    <section className="panel mt-12 grid gap-3 p-5"><p className="m-0 font-black">现场控制</p><DemoResetButton /><VoteLink className="button warning" /><p className="m-0 text-sm font-bold">觉得这个问题值得被研究？为它投一票。（直接贴作者身上也行）</p></section>
  </section></main>;
}
