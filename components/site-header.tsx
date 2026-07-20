import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="site-header" data-compact={compact}>
      <Link href="/" className="brand" aria-label="AITI 首页"><span>AITI</span><small>AI 哄感档案</small></Link>
      <nav aria-label="主要导航">
        <Link href="/types">16型</Link>
        <Link href="/research">研究</Link>
        <Link href="/about">说明</Link>
      </nav>
    </header>
  );
}
