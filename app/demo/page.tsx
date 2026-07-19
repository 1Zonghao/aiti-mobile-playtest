import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";

export const metadata: Metadata = { title: "大会演示模式" };
const entries = [
  ["01","开始测试","12道完整AI互动场景","/test"],
  ["02","查看8个爆款人格","进入16型档案馆，首发型有完整内容","/types"],
  ["03","查看平台更新事件","直接播放整段更新冲击，不读取测试状态","/demo/update"],
  ["04","查看研究核心问题","用普通话解释研究边界与平台权力","/research"]
] as const;
export default function DemoPage() { return <main className="page-shell"><SiteHeader /><section className="py-12"><p className="eyebrow">CONFERENCE DEMO</p><h1 className="section-title mt-4">大会演示模式</h1><p className="max-w-2xl text-lg leading-8">这些入口不会读取或修改普通用户的测试状态。开始测试除外：只有你主动点击后才会创建新会话。</p><div className="research-grid mt-9">{entries.map(([num,title,copy,href]) => <Link className="research-card panel no-underline" href={href} key={num}><strong>{num}</strong><h2 className="text-2xl font-black">{title}</h2><p className="leading-7">{copy}</p><span className="font-black">打开 →</span></Link>)}</div></section></main>; }
