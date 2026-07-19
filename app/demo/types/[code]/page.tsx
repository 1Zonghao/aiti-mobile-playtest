import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterVisual } from "../../../../components/character-visual";
import { resultTypeByCode, resultTypesContent } from "../../../../src/content";
import type { TypeCode } from "../../../../src/types";

type Props = { params: Promise<{ code: string }> };
export function generateStaticParams() { return resultTypesContent.types.filter((type) => type.featured).map((type) => ({ code: type.code.toLowerCase() })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { code } = await params; const result = resultTypeByCode.get(code.toUpperCase() as TypeCode); return { title: result ? `演示预览 · ${result.name}` : "演示预览" }; }
export default async function DemoTypePage({ params }: Props) {
  const { code } = await params;
  const result = resultTypeByCode.get(code.toUpperCase() as TypeCode);
  if (!result || !result.featured) notFound();
  return <main className="page-shell"><article className="demo-preview"><p className="demo-badge">演示预览 · 不保存为测试结果</p><CharacterVisual result={result} priority /><p className="eyebrow mt-7">AITI TYPE</p><h1 className="result-code">{result.code}</h1><h2 className="result-name">{result.name}</h2><p className="result-definition">{result.definition}</p><p className="fact-card">{result.roast}</p><div className="grid gap-3 sm:grid-cols-2"><Link className="button" href="/test">开始完整测试</Link><Link className="button secondary" href="/demo#featured">返回演示菜单</Link></div></article></main>;
}
