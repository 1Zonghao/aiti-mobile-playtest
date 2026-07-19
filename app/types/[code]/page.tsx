import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterVisual } from "../../../components/character-visual";
import { SiteHeader } from "../../../components/site-header";
import { disclaimersContent, resultTypeByCode, resultTypesContent } from "../../../src/content";
import type { TypeCode } from "../../../src/types";

type Props = { params: Promise<{ code: string }> };
export function generateStaticParams() { return resultTypesContent.types.map((type) => ({ code: type.code.toLowerCase() })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { code } = await params; const result = resultTypeByCode.get(code.toUpperCase() as TypeCode); return result ? { title: `${result.code} ${result.name}`, description: result.definition } : { title: "未找到类型" }; }
export default async function TypeDetailPage({ params }: Props) {
  const { code } = await params;
  const result = resultTypeByCode.get(code.toUpperCase() as TypeCode);
  if (!result) notFound();
  return <main className="page-shell"><SiteHeader /><article className="mx-auto grid max-w-4xl gap-8 py-12 md:grid-cols-2"><CharacterVisual result={result} priority /><section><p className="eyebrow">AITI TYPE</p><h1 className="result-code mt-5">{result.code}</h1><h2 className="result-name">{result.name}</h2><p className="result-definition">{result.definition}</p>{result.resultTitle && <p className="text-xl font-black">{result.resultTitle}</p>}<dl className="mt-7 grid gap-4"><div className="fact-card"><dt>致命AI台词</dt><dd>{result.fatalLine}</dd></div><div className="fact-card"><dt>平台更新暴击</dt><dd>{result.platformFear}</dd></div><div className="fact-card"><dt>安全彩蛋</dt><dd>{result.safetyNote ?? disclaimersContent.researchBoundary.resultMeaning}</dd></div></dl><div className="mt-7 flex flex-wrap gap-3"><Link className="button" href="/test">开始测试</Link><Link className="button secondary" href="/types">返回16型</Link></div></section></article></main>;
}
