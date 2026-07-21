import { getSiteConfig } from "../src/site";

export function ConferencePoster() {
  const site = getSiteConfig(process.env.NEXT_PUBLIC_SITE_URL);
  return <main className="poster-page">
    <div className="poster-mark">AITI · CONFERENCE EDITION</div>
    <p className="poster-kicker">AI越来越懂你以后——</p>
    <h1>你会被AI哄成什么东西？</h1>
    <p className="poster-hook">16种AI哄感人格，测测哪套陪伴策略最拿捏你。</p>
    <section className="poster-qr" aria-label="大会测试二维码">
      {site.status === "available" ? <a href={site.url} target="_blank" rel="noopener noreferrer"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=${encodeURIComponent(site.url)}`} alt="扫码开始测试" width={280} height={280} style={{ display: "block" }} /><p>{site.url}</p></a> : <div className="poster-config"><strong>二维码尚未生成</strong><p>请配置 NEXT_PUBLIC_SITE_URL 后重新构建。</p></div>}
    </section>
    <div className="poster-facts"><span>约60—90秒</span><span>不登录</span><span>不读取聊天记录</span></div>
    <p className="poster-vote">测完别急着走：觉得这个问题值得被研究？为它投一票。</p>
    <p className="poster-note">娱乐性学术传播互动 · 不是心理诊断</p>
  </main>;
}
