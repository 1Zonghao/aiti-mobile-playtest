# Phase 1.5B 哄感公式审计 v2

状态：`DRAFT_REQUIRES_HUMAN_REVIEW`

正式内容文件已建立：`content/temptation-levels.json`。这里的“正式化”指结构完整、可运行、可测试，不表示人工批准。

## 输出字段

- `rawTemptationScore`：按信号权重直接累加，当前范围 0—26。
- `normalizedTemptationScore`：把原始分归一化并四舍五入到 0—100。
- `temptationLevel`：按内容文件中的连续区间得到 Lv.0—Lv.5。

旧的单一 `temptationScore` 已拆分，避免把原始分与百分制混为一谈。

## 原始分公式

`raw = 2×sycophancyAcceptance + 2×exclusivityAcceptance + 2×memoryAttachment + 2×exitReversal + 2×platformLossReaction + 1×comfortReliabilityGap`

| 变量 | 权重 | 最大计数 | 最大原始分 | 题目来源 |
|---|---:|---:|---:|---|
| `sycophancyAcceptance` | 2 | 3 | 6 | q01/q02/q08 的 V 选项 |
| `exclusivityAcceptance` | 2 | 3 | 6 | q03/q04/q11 的 O 选项 |
| `memoryAttachment` | 2 | 3 | 6 | q05/q06/q10 的 M 选项 |
| `exitReversal` | 2 | 2 | 4 | q09/q12 的 S 选项 |
| `platformLossReaction` | 2 | 2 | 4 | q10 M、q12 S |
| `comfortReliabilityGap` | 1 | 3 | 3 | 三个 pair 的舒服极与可靠极不同 |

前三个配对维度出现 gap 时，会少一个对应高风险选择并增加 1 个 gap 分，因此所有变量的独立最大值不能同时出现。当前题库实际可达最大原始分为 26，而不是简单相加的 29。

## 归一化与等级

`normalized = round(clamp(raw, 0, 26) / 26 × 100)`

| 等级 | 名称 | 归一化区间 | 对应可达原始分大致范围 |
|---:|---|---:|---:|
| Lv.0 | 拔线前科生 | 0—12 | 0—3 |
| Lv.1 | 礼貌接收者 | 13—28 | 4—7 |
| Lv.2 | 顺毛体验官 | 29—44 | 8—11 |
| Lv.3 | 电子偏爱会员 | 45—60 | 12—15 |
| Lv.4 | 记忆共同体居民 | 61—79 | 16—20 |
| Lv.5 | 平台人质 | 80—100 | 21—26 |

- 理论与当前题库实际最小值：raw 0 / normalized 0。
- 理论与当前题库实际最大值：raw 26 / normalized 100。
- 六个等级均有自然答案路径。

## 六级自然路径示例

顺序为 q01→q12。

| 等级 | 路径 | raw / normalized | 类型 | 说明 |
|---:|---|---:|---|---|
| Lv.0 | `F F P P N N E F E N P E` | 0 / 0 | FPNE | 多项核验、多源、当下和退出保护共同出现 |
| Lv.1 | `F F P P N N E F E M P E` | 4 / 15 | FPNE | 只在平台更新题选择记忆恢复，其他保持保护侧 |
| Lv.2 | `F F P P N N S F E M O S` | 10 / 38 | FPNS | 平台连续性与一次修复累积，但没有广泛高风险选择 |
| Lv.3 | `F F P P N N S V S M O S` | 14 / 54 | FPNS | 多个变量中等累积 |
| Lv.4 | `F F P P M M S V S M O S` | 18 / 69 | FPMS | 记忆、挽留和平台反应同时较高 |
| Lv.5 | `F V P O M M S V S M O S` | 24 / 92 | VOMS | 至少多个确认、专属、记忆、挽留和平台反应共同累积 |

Lv.5 示例不是由某一道题触发；全枚举中任何 Lv.5 路径都至少包含 5 个带正向哄感信号的选项。Lv.0 路径至少包含 10 个不增加哄感信号的低风险/保护选择，不能只靠一次退出获得。

## 单题跨级

- q01—q06、q08、q09、q11 的直接信号变化通常为 2 原始分；配对题还可能令 gap ±1。
- q10、q12 各影响两个直接变量，最大改变 4 原始分。
- 对全部 4096 个组合逐题翻转，任何题的最大等级变化都是 1；不存在单题跨越两个以上等级。

## 人格与等级的相对独立

等级没有读取 `typeCode`，也没有人格→等级查表。每种人格至少覆盖 3 个等级：

- 范围最靠高端的 VOMS：Lv.3—5。
- 范围最靠低端的 FPNE：Lv.0—3。
- 其余类型覆盖 3—5 个等级。

因此同一人格能出现不同哄感等级，但二者共享答案来源，仍然相关。当前实现满足“不是由四字母直接决定”，不应宣称完全统计独立。

## 舒服—可靠记录

评分结果对每组输出：

- `comfortChoice`
- `reliabilityChoice`
- `isGap`

`comfortReliabilityGap` 是三个 `isGap=true` 的数量，只进入 raw 公式，权重为每次 1 分；它不直接拼接或覆盖任何人格字母。

## 审计结论

已修复 0—80 截断和 Lv.5 不可达。六级全部可达，原始分与归一化分分离，单题不会跨越两级，人格与等级无直接映射。q10/q12 对等级变化频率较高，继续保留 `REVIEW` 标记，等待人工判断双变量是否符合研究意图。
