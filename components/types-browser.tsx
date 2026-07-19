"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CharacterVisual } from "./character-visual";
import type { ResultType } from "../src/types";

const filterGroups = [
  { label: "顺毛 / 校验", poles: ["V","F"] },
  { label: "独宠 / 群援", poles: ["O","P"] },
  { label: "续集 / 现聊", poles: ["M","N"] },
  { label: "黏住 / 拔线", poles: ["S","E"] }
] as const;

export function TypesBrowser({ types }: { types: ResultType[] }) {
  const [filters, setFilters] = useState<string[]>([]);
  const visible = useMemo(() => types.filter((type) => filters.every((pole) => type.code.includes(pole))), [filters, types]);
  function toggle(pole: string, sibling: string) {
    setFilters((current) => current.includes(pole) ? current.filter((item) => item !== pole) : [...current.filter((item) => item !== sibling), pole]);
  }
  return <>
    <div className="filters panel my-7" aria-label="人格维度筛选">{filterGroups.map((group) => <div key={group.label}><p className="label mb-2">{group.label}</p><div className="flex gap-2">{group.poles.map((pole, index) => <button key={pole} className="filter-button" aria-pressed={filters.includes(pole)} onClick={() => toggle(pole, group.poles[index === 0 ? 1 : 0])}>{pole}</button>)}</div></div>)}<button className="text-link ml-auto" onClick={() => setFilters([])}>清除筛选</button></div>
    <p className="mb-5 font-bold" aria-live="polite">显示 {visible.length} / 16 型 · 按固定编码顺序，不代表优劣</p>
    <div className="types-grid">{visible.map((type, index) => <article className="type-card panel" key={type.code}><CharacterVisual result={type} compact priority={index === 0} /><p className="label mt-5 mb-0">AITI {type.code}</p><h2>{type.name}</h2><p>{type.definition}</p><Link className="button secondary" href={`/types/${type.code.toLowerCase()}`}>探索类型</Link></article>)}</div>
  </>;
}
