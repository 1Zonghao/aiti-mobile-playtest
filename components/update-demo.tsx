"use client";

import Link from "next/link";
import { useState } from "react";

export function UpdateDemo() {
  const [phase,setPhase] = useState(1);
  const copy = [
    ["更新前 · 熟悉模式","“小鱼，你又替豆包担心了。”","它记得称呼、共同记忆，也记得你说“算了”通常不是真的算了。"],
    ["版本迁移中","人格模块 3.7 → 4.0","正在迁移记忆摘要。旧人格版本恢复状态：未知。"],
    ["更新后 · 标准模式","“您好，有什么可以帮您？”","称呼消失，共同记忆无法识别，语气变成标准助手。"],
    ["用户反应","你会留下修复，还是下载记录后离开？","真实流程会在这里记录第12题答案；演示模式不会写入任何测试状态。"]
  ][phase-1]!;
  return <main className="update-stage" data-phase={Math.min(phase,3)}><div className="screen gap-5"><header><span className="label">DEMO · 平台更新事件 / PHASE {phase}/4</span><div className="progress-track mt-2"><div className="progress-fill" style={{width:`${phase*25}%`}} /></div></header><section className="panel update-console flex flex-1 flex-col justify-center p-6"><div className="glitch-line"/><p className="eyebrow">{copy[0]}</p><h1 className="mt-5 text-4xl font-black leading-tight">{copy[1]}</h1><p className="text-lg leading-8">{copy[2]}</p><div><span className="memory-chip">小鱼</span><span className="memory-chip">豆包</span><span className="memory-chip">共同记忆</span></div></section>{phase < 4 ? <button className="button" onClick={()=>setPhase(value=>value+1)}>继续演示</button> : <div className="grid gap-3"><Link className="button" href="/test">开始真实测试</Link><Link className="button secondary" href="/demo">返回演示菜单</Link></div>}<button className="text-link" onClick={()=>setPhase(4)}>跳过更新过程</button></div></main>;
}
