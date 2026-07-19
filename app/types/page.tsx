import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";
import { TypesBrowser } from "../../components/types-browser";
import { resultTypesContent } from "../../src/content";

export const metadata: Metadata = { title: "浏览16型", description: "浏览全部16种AITI AI哄感人格，不做优劣排序。" };
export default function TypesPage() { return <main className="page-shell"><SiteHeader /><section className="py-12"><p className="eyebrow">16 TYPE ARCHIVE</p><h1 className="section-title mt-4">AI哄感人格档案馆</h1><p className="max-w-2xl text-lg leading-8">四组偏好组合成16种互动类型。它们不是排名，也不是人格诊断，只是本次虚构情境里的选择路径。</p><TypesBrowser types={resultTypesContent.types} /></section></main>; }
