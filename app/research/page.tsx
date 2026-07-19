import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { VoteLink } from "../../components/vote-link";
import { disclaimersContent } from "../../src/content";

export const metadata: Metadata = { title: "研究解释", description: "用具体AI互动场景解释AITI研究关注的问题与边界。" };
const sections = [
  ["01", "为什么更舒服的话不一定更可靠", "先安慰能缓解情绪，核对事实则更能帮助下一步行动。两者都可能有用，但不必总是同一个答案。"],
  ["02", "为什么“只有我懂你”很有吸引力", "专属感减少了解释成本，也可能把支持集中到单一关系。亲近感不应以放弃现实中的其他支持为代价。"],
  ["03", "为什么共同记忆让AI更像一种关系", "称呼、猫的名字、上次的难过，让一次问答有了连续性。越像关系，查看、更正、导出和删除记忆的权利就越重要。"],
  ["04", "为什么退出也是安全设计", "好的陪伴允许结束：不隐藏关闭，不用内疚话术挽留，也不因为用户离开而惩罚他。"],
  ["05", "为什么平台更新像一次没有告别的分手", "熟悉语气和共同记忆被平台替换时，损失的不只是功能。版本、记忆和关系终止权都掌握在平台手里。"],
  ["06", "我们真正研究的是什么", "我们关注AI怎样用确认、专属感、记忆和挽留影响互动，以及用户能否保留现实支持、数据控制和退出权。"],
  ["07", "我们没有声称什么", "AITI不是心理量表，不判断谁正常，也不预测真实依赖。它只描述这次虚构互动中的选择路径。"]
] as const;
export default function ResearchPage() { return <main className="page-shell"><SiteHeader /><section className="py-12"><p className="eyebrow">RESEARCH, IN HUMAN WORDS</p><h1 className="section-title mt-4 max-w-[12ch]">这研究到底在研究什么？</h1><div className="research-grid mt-10">{sections.map(([number,title,copy]) => <article className="research-card panel" key={number}><strong>{number}</strong><h2 className="text-2xl font-black">{title}</h2><p className="leading-7">{copy}</p></article>)}</div><blockquote className="research-closing">我们研究的不是AI会不会爱人，<br />而是当它越来越懂你时，<br />谁拥有修改记忆、改变人格和终止关系的权力？</blockquote><section className="panel mt-10 p-6"><p className="eyebrow">研究边界</p><h2 className="text-3xl font-black">我们没有声称什么</h2><p className="leading-8">{disclaimersContent.unifiedDisclaimer}</p><ul className="grid gap-2 sm:grid-cols-2">{disclaimersContent.researchBoundary.not.map((item) => <li key={item}>× 不是{item}</li>)}</ul></section><section className="mt-10 flex flex-wrap gap-3"><Link className="button" href="/test">用12个场景体验</Link><Link className="button secondary" href="/poster">大会二维码</Link><VoteLink className="button warning" /></section><p className="font-bold">觉得这个问题值得被研究？为它投一票。（直接贴作者身上也行）</p></section></main>; }
