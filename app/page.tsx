import Link from "next/link";
import { CharacterVisual } from "../components/character-visual";
import { SiteHeader } from "../components/site-header";
import { StartButton } from "../components/start-button";
import { resultTypeByCode, siteCopyContent } from "../src/content";

export default function HomePage() {
  const voms = resultTypeByCode.get("VOMS");
  const fone = resultTypeByCode.get("FONE");
  if (!voms || !fone) throw new Error("首页角色内容不完整。");
  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI Intimacy Temptation Indicator</p>
          <h1 className="display-title">{siteCopyContent.campaignTitle}</h1>
          <p className="hero-subtitle">{siteCopyContent.coverSubtitle}</p>
          <div className="hero-actions"><StartButton /><Link className="button secondary" href="/demo">大会演示模式</Link></div>
          <p className="mt-4 font-bold">约60—90秒 · 12个AI互动场景</p>
          <ul className="quick-tags" aria-label="测试说明"><li>不登录</li><li>不读取聊天记录</li><li>不是心理诊断</li></ul>
          <div className="mt-6 flex flex-wrap gap-5 text-sm font-bold"><Link href="/types">浏览16型 →</Link><Link href="/research">这研究到底在研究什么 →</Link></div>
        </div>
        <div className="hero-visual" aria-label="赛博正宫与拔线仙人对撞主视觉">
          <p className="label mb-3 text-center">EXCLUSIVE MODE × EXIT READY</p>
          <div className="hero-duel"><CharacterVisual result={voms} compact priority /><CharacterVisual result={fone} compact priority /></div>
        </div>
      </section>
    </main>
  );
}
