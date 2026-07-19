"use client";

import { useState } from "react";
import { getCharacterAsset } from "../src/lib/character-assets";
import type { ResultType, TypeCode } from "../src/types";

const fallbackPalettes: Record<string, string[]> = {
  V: ["#b9e5c9", "#f3ead7", "#ef5b4c", "#173f35"],
  F: ["#9dc9bc", "#e7e7df", "#e56b3f", "#173f35"]
};

export function getPalette(result: ResultType): string[] {
  return result.palette.hex ?? fallbackPalettes[result.code[0] ?? "F"] ?? fallbackPalettes.F!;
}

export function CharacterVisual({ result, priority = false, compact = false }: { result: ResultType; priority?: boolean; compact?: boolean }) {
  const asset = getCharacterAsset(result.code as TypeCode);
  const palette = getPalette(result);
  const [failed, setFailed] = useState(false);
  if (asset.official && !failed) {
    return (
      <div className="character-frame" data-compact={compact}>
        <img src={asset.src} alt={result.name} loading={priority ? "eager" : "lazy"} sizes={compact ? "(max-width: 720px) 45vw, 260px" : "(max-width: 720px) 90vw, 520px"} className="object-contain" style={{ width: "100%", height: "100%" }} onError={() => setFailed(true)} />
      </div>
    );
  }
  const tool = result.visualKeywords[1] ?? "关系道具";
  return (
    <div className="character-frame character-fallback" data-compact={compact} style={{ "--char-main": palette[0], "--char-dark": palette[1], "--char-alert": palette[2], "--char-paper": palette[3] } as React.CSSProperties} role="img" aria-label={`${result.name}的几何占位角色`}>
      <div className="orbit orbit-a" />
      <div className="orbit orbit-b" />
      <div className="poly-person" aria-hidden="true">
        <div className="poly-head"><i /><i /></div>
        <div className="poly-body" />
        <div className="poly-tool" />
      </div>
      <div className="character-code">{result.code}</div>
      <div className="character-prop">{tool}</div>
      <p>平台暂时还没给它发身体</p>
    </div>
  );
}
