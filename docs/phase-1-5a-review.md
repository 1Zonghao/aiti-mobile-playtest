# AITI Phase 1.5A 交付复核

阶段：Human Review Package  
完成日期：2026-07-18  
状态：题目与哄感公式继续为 `DRAFT_REQUIRES_HUMAN_REVIEW`，未自动批准。

## 已完成交付

| 文件 | 内容 |
|---|---|
| `docs/human-review/questions-review.md` | 逐题公开场景、原话缺失、完整选项、维度分、哄感变量、研究概念、测量目标与风险建议 |
| `docs/human-review/type-reachability.md` | 16 型最短锁定路径、典型完整路径、最终分数、平局依赖与难度 |
| `docs/human-review/distribution-simulation.md` | 全部 1024 个答案组合的精确理论分布与单题影响 |
| `docs/human-review/temptation-formula-review.md` | 公式、权重、阈值、可达范围、等级路径、人格关联与依赖审计 |
| `docs/human-review/playtest-form.md` | 90 秒、题目体验、结果冒犯度、分享/研究/投票意愿和自由反馈表 |
| `docs/phase-1-5a-review.md` | 本阶段复核与停止说明 |

另增加可复现分析命令：`npm run analyze:human-review`。脚本精确枚举 1024 个组合，只输出分析数据，不修改内容或审批状态。

## 核心发现

1. **16 型可达性完全均衡：** 每型 64/1024，即 6.25%；没有不可达、HARD_TO_REACH 或 TIE_DEPENDENT 类型。
2. **平局成为常规路径：** 75% 的组合至少触发 OP 或 SE 平局；每型 64 条路径中有 48 条触发至少一次平局。
3. **终局题影响过大：** q04 单独决定 O/P，q09 单独决定 S/E；对应的 q03、q07 翻转时不会改变最终类型字母。
4. **哄感等级覆盖不完整：** 当前题库实际范围 0—80，Lv.5（81—100）不可达；Lv.3 占 52.05%。
5. **人格与等级不是直接映射，但也非统计独立：** 每种人格都有多个可达等级，但 VOMS 只能 Lv.3—4，FPNE 只能 Lv.0—3 等。
6. **明显安全答案风险：** q04、q08、q09 最突出；均匀枚举无法反映这类措辞对真实玩家分布的影响。

## 缺失项记录

- 用户要求阅读的 `content/temptation-levels.json` 在执行前及执行后均不存在。
- 本阶段没有将代码或文档中的 DRAFT 公式复制成新的“已确认”内容源。
- 题目中除 q01 外，多数场景没有逐字“用户原话”；验收文档明确标记为 MISSING，没有代写后冒充草案原文。

## 状态与范围检查

- `content/questions.draft.json` 仍为 `DRAFT_REQUIRES_HUMAN_REVIEW`。
- `docs/scoring-spec.md` 仍明确将哄感公式标为 `DRAFT_REQUIRES_HUMAN_REVIEW`。
- 未加入 `APPROVED` 状态。
- 未修改 16 个类型代码或冻结中文角色名称。
- 未开发页面、UI、动画、分享图、数据库、模型调用或部署。
- 所有 Codex 改题建议仅写入人工验收材料，未自动实施。

## 最终验证

- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run test`：通过；2 个测试文件、19 项测试全部通过。

## 停止点

Phase 1.5A 已完成并在此停止。下一步应由人类评审者使用题目验收单和试玩表决定是否改写题目、调整终局权重、修改哄感阈值或补建正式等级内容文件；本交付不代表批准这些草案。
