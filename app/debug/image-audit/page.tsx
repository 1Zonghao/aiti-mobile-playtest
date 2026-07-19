import Image from "next/image";
import { resultTypesContent } from "../../../src/content";

export default function ImageAuditPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Image Audit — 16 型对照检查</h1>
      <p>对照下面的列表，找出图片和代码/名称不匹配的类型，记下来告诉我。</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {resultTypesContent.types.sort((a, b) => a.code.localeCompare(b.code)).map((type) => (
          <div key={type.code} style={{ border: "2px solid #ccc", padding: 16, borderRadius: 8 }}>
            <h2 style={{ margin: 0 }}>{type.code} · {type.name}</h2>
            <p style={{ margin: "4px 0", color: "#666" }}>{type.definition}</p>
            <div style={{ width: "100%", aspectRatio: "4/5", position: "relative", background: "#f5f5f5", borderRadius: 4 }}>
              <Image
                src={`/characters/${type.code.toLowerCase()}.webp`}
                alt={`${type.code} ${type.name}`}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              文件: /characters/{type.code.toLowerCase()}.webp
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
