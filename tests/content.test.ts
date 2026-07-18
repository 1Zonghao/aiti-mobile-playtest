import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { documentSchemas, questionsDocumentSchema, resultTypesDocumentSchema, temptationLevelsDocumentSchema } from "../src/schemas.js";
import { TYPE_CODES } from "../src/types.js";

async function readJson(filename: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve("content", filename), "utf8"));
}

describe("版本化内容", () => {
  it("全部 JSON 通过各自的 Zod Schema", async () => {
    for (const [filename, schema] of Object.entries(documentSchemas)) {
      expect(schema.safeParse(await readJson(filename)).success, filename).toBe(true);
    }
  });

  it("Markdown 中可提取全部 16 型，且与标准代码一致", async () => {
    const markdown = await readFile(resolve("source-materials", "aiti-character-system.md"), "utf8");
    const codes = [...markdown.matchAll(/^##\s+\d+\.\s+([VF][OP][MN][SE])｜/gm)].map((match) => match[1]);
    expect(codes).toHaveLength(16);
    expect([...codes].sort()).toEqual([...TYPE_CODES].sort());
  });

  it("类型代码、中文名称和优先级均唯一，四维代码顺序正确", async () => {
    const result = resultTypesDocumentSchema.parse(await readJson("result-types.json"));
    expect(new Set(result.types.map((type) => type.code)).size).toBe(16);
    expect(new Set(result.types.map((type) => type.name)).size).toBe(16);
    expect(new Set(result.types.map((type) => type.priority)).size).toBe(16);
    for (const type of result.types) {
      expect(`${type.dimensions.VF}${type.dimensions.OP}${type.dimensions.MN}${type.dimensions.SE}`).toBe(type.code);
    }
  });

  it("缺失必填人格字段时校验失败", async () => {
    const document = structuredClone(await readJson("result-types.json")) as { types: Record<string, unknown>[] };
    delete document.types[0]?.name;
    expect(resultTypesDocumentSchema.safeParse(document).success).toBe(false);
  });

  it("免责声明存在，结果与题目不使用诊断断言", async () => {
    const disclaimers = await readJson("disclaimers.json") as { unifiedDisclaimer: string; forbiddenDiagnosticPhrases: string[] };
    expect(disclaimers.unifiedDisclaimer.length).toBeGreaterThan(0);
    const searchable = JSON.stringify({ results: await readJson("result-types.json"), questions: await readJson("questions.draft.json") });
    for (const phrase of disclaimers.forbiddenDiagnosticPhrases) expect(searchable).not.toContain(phrase);
  });

  it("题目与哄感等级内容继续保持人工审核草案状态", async () => {
    const questions = questionsDocumentSchema.parse(await readJson("questions.draft.json"));
    const levels = temptationLevelsDocumentSchema.parse(await readJson("temptation-levels.json"));
    expect(questions.status).toBe("DRAFT_REQUIRES_HUMAN_REVIEW");
    expect(levels.status).toBe("DRAFT_REQUIRES_HUMAN_REVIEW");
  });
});
