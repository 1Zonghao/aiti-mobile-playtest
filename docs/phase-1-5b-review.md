# Phase 1.5B 交付复核

状态：完成工程结构修复；题目与哄感公式仍为 `DRAFT_REQUIRES_HUMAN_REVIEW`。

## 修复结果

| 指标 | 修复前 | 修复后 |
|---|---:|---:|
| 题目数 | 10 | 12 |
| 至少一次维度平局 | 75% | 0% |
| 单维度平局率 | 存在高频平局 | 四维均 0% |
| 固定平局规则使用率 | 大量使用 | 0% |
| q04 对 O/P 的单题决定权 | 100% | 无；答案切换边际影响 50% |
| q09 对 S/E 的单题决定权 | 100% | 无；答案切换边际影响 50% |
| q03、q07 对人格的边际影响 | 0% | 均为 50% |
| 哄感计分 | 实际 0—80 | 原始 0—26，归一化 0—100 |
| Lv.5 | 不可达 | 可达，316/4096（7.7148%） |

四个维度现在各由 3 道等权独立题共同决定。终局题只提供与其他题相同的 1 票，不再具有决定性权重。稳定平局规则仍保留为防御性机制，但当前合法问卷的精确枚举不会触发它。

## 精确枚举结论

- 枚举全部 `2^12 = 4096` 个答案组合，不使用抽样或随机数。
- 16 种人格全部可达，每型恰有 256 个组合，占 6.25%。
- 四个维度两极各占 50%，维度平局率均为 0%。
- 6 个哄感等级全部可达；Lv.0 到 Lv.5 的组合数分别为 20、192、772、1408、1388、316。
- 每道维度题切换答案时，最终人格代码在 50% 的配对路径上变化。
- 不存在单题 100% 决定某个维度，也不存在完全不影响人格的题。
- 每种人格均找到至少 3 条无平局自然路径，并覆盖至少 3 个哄感等级；未发现 `STRUCTURALLY_WEAK` 类型。

均匀枚举只用于检查评分结构，不代表真实用户分布。

## 哄感等级

新增 `content/temptation-levels.json`，固定保留 6 个既定等级名称。分数由奉承接受、排他接受、记忆依附、退出反转、平台损失反应及舒服—可靠背离分别累计，再从原始 0—26 归一化到 0—100。人格代码不参与等级公式。

Lv.5 至少需要 5 个高风险信号，Lv.0 至少需要 10 个低风险或退出保护选择。任意单题切换最多跨越 1 个等级。q10 与 q12 的等级变化覆盖率较高（92.19%），原因是各自承载两个哄感信号；已在影响审计中标记为人工评审重点，但它们仍不会让单次作答跨越两个等级。

## 数据与接口变化

- 题目选项使用 `dimensionEffects` 数组，限制为一个主要维度及至多一个弱次要维度。
- 题目声明 `scoringRole`，纯哄感题若将来加入必须显式标记；当前 12 题均为维度题。
- 评分结果保留 `rawTemptationScore`、`normalizedTemptationScore`、`temptationLevel`。
- 三组双选分别输出 `comfortChoice`、`reliabilityChoice`、`isGap`。
- Zod Schema 校验题目覆盖、奇数票结构、双选配对、等级连续区间、固定状态及 6 个等级名称。

## 交付物

- `content/questions.draft.json`
- `content/temptation-levels.json`
- `src/scoring.ts`
- `src/types.ts`
- `src/schemas.ts`
- `tests/content.test.ts`
- `tests/scoring.test.ts`
- `docs/human-review/question-impact-analysis.md`
- `docs/human-review/distribution-simulation-v2.md`
- `docs/human-review/type-reachability-v2.md`
- `docs/human-review/temptation-formula-review-v2.md`
- `docs/phase-1-5b-review.md`

## 验证

- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run test`：通过，2 个测试文件、20 项测试全部通过。

本阶段未开发页面、未接入模型、未修改 16 种人格名称，也未把任何草案状态改为 `APPROVED`。
