import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { documentSchemas } from "../src/schemas.js";

export async function validateAllContent(root = process.cwd()): Promise<void> {
  const failures: string[] = [];
  for (const [filename, schema] of Object.entries(documentSchemas)) {
    const path = resolve(root, "content", filename);
    try {
      const json: unknown = JSON.parse(await readFile(path, "utf8"));
      const result = schema.safeParse(json);
      if (!result.success) failures.push(`${filename}: ${result.error.issues.map((issue) => issue.message).join("; ")}`);
    } catch (error) {
      failures.push(`${filename}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failures.length > 0) throw new Error(`内容校验失败：\n${failures.join("\n")}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await validateAllContent();
  console.log(`已通过 ${Object.keys(documentSchemas).length} 个内容文档的 Schema 校验。`);
}
