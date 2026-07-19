# AITI 内容 Schema

## 版本规则

全部内容文档包含：

- `schemaVersion`: 语义化 Schema 版本，当前为 `1.0.0`。
- `contentVersion`: 正式内容快照标识，当前为 `aiti-content-v1`。

Schema 变化时更新 `schemaVersion`；只修改内容时更新 `contentVersion`。

## 文档清单

| 文件 | 根数据 | 关键约束 |
|---|---|---|
| `dimensions.json` | 四维定义 | 固定 4 项、固定位置和 `VF-OP-MN-SE` 顺序 |
| `result-types.json` | 16 型角色 | 固定 16 项、代码/名称唯一、dimensions 必须重建自身 code |
| `featured-types.json` | 8 个首发卡 | 固定 8 项，代码受标准 TypeCode 约束 |
| `visual-guidelines.json` | 统一视觉规范 | 分区、边距和规则结构化 |
| `site-copy.json` | 站点核心文案 | 封面、按钮、角标、研究投票与 3 个封面方案 |
| `disclaimers.json` | 免责声明与边界 | 免责声明非空，明确 5 类非目标 |
| `questions.draft.json` | 10 道题目草案 | 固定草案状态、题量覆盖、3 组配对、4 维终局题、平台更新终局题 |

## 结果类型字段

每种人格包含 `code`、`name`、`definition`、`resultTitle`、`fatalLine`、`platformFear`、`roast`、`safetyNote`、`shareText`、`dimensions`、`palette`、`visualKeywords`、`imagePath`、`featured` 和 `priority`。

原文未提供的字段不伪造：可空字段写为 `null`，并在 `fieldStatus` 标记 `MISSING`。配色同时保存 `description`、可空 `hex` 和状态。

## 题目字段

每道题包含：

- `id`：稳定标识。
- `pairId`：舒服/可靠配对场景标识；非配对题为 `null`。
- `responseKind`：`COMFORT`、`RELIABILITY` 或 `STANDARD`。
- `dimension`：唯一影响的维度。
- `terminalFor`：平局终局裁决维度，可为 `null`。
- `platformUpdateFinale`：是否为平台更新终局题。
- `options`：固定两个选项；每个选项只给一个维度的一个极加 1 分。
- `temptationSignals`：独立哄感算法信号，不改变四字母评分。

## 运行时校验

Zod Schema 位于 `src/schemas.ts`。执行：

```bash
npm run validate:content
```

脚本会读取全部 7 个 JSON 文档并汇总错误。严格 TypeScript 类型位于 `src/types.ts`。
