import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { VoteLink } from "../../components/vote-link";
import { disclaimersContent } from "../../src/content";

export const metadata: Metadata = { title: "研究解释", description: "用具体AI互动场景解释AITI研究关注的问题与边界。" };
const sections = [
  ["01","你刚刚不是在选“正确答案”","同一个场景里，“先接住我”和“先帮我查清楚”都可能有用。测试记录的是哪种回应此刻更能影响你。"],
  ["02","更舒服，不一定更可靠","群里被同事质疑时，先安慰你能缓解情绪；核对需求和上下文则更能帮助下一步行动。舒服与可靠可以是两道不同的问题。"],
  ["03","“只有我懂你”为什么有吸引力","专属感减少了解释成本，也可能把支持集中到单一关系。我们关注AI如何提供亲近感，同时仍鼓励现实中的多源支持。"],
  ["04","共同记忆会把工具变成“关系”","称呼、猫的名字、上次的难过，让一轮问答有了连续性。连续性越重要，查看、更正、导出和删除记忆的权利越重要。"],
  ["05","退出按钮也是安全设计","好的陪伴允许结束，不隐藏关闭、不用内疚话术挽留，也不因为用户离开而惩罚他。"],
  ["06","平台更新像一次没有告别的分手","当熟悉的语气和共同记忆被平台替换，损失的不只是功能。平台掌握版本、记忆和关系终止权，这正是研究问题的一部分。"]
] as const;
export default function ResearchPage() { return <main className="page-shell"><SiteHeader /><section className="py-12"><p className="eyebrow">RESEARCH, IN HUMAN WORDS</p><h1 className="section-title mt-4 max-w-[12ch]">这研究到底在研究什么？</h1><p className="mt-6 max-w-3xl text-xl leading-9">我们研究的不是AI会不会爱人，而是当它越来越懂你时，谁拥有修改记忆、改变人格和终止关系的权力？</p><div className="research-grid mt-10">{sections.map(([number,title,copy]) => <article className="research-card panel" key={number}><strong>{number}</strong><h2 className="text-2xl font-black">{title}</h2><p className="leading-7">{copy}</p></article>)}</div><section className="panel mt-10 p-6"><p className="eyebrow">研究边界</p><h2 className="text-3xl font-black">我们没有声称什么</h2><p className="leading-8">{disclaimersContent.unifiedDisclaimer}</p><ul className="grid gap-2 sm:grid-cols-2">{disclaimersContent.researchBoundary.not.map((item) => <li key={item}>× 不是{item}</li>)}</ul></section><section className="mt-10 flex flex-wrap gap-3"><Link className="button" href="/test">用12个场景体验</Link><button className="button secondary" disabled>论文 / 海报入口预留</button><VoteLink className="button warning" /></section></section></main>; }
