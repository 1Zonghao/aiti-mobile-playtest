# AITI 评分规范

版本：Phase 1.5B  
状态：题目与哄感公式均为 `DRAFT_REQUIRES_HUMAN_REVIEW`。

## 四维评分

12 道题均为 `DIMENSION`，四维各有 3 道等权主要题。每个选项通过 `dimensionEffects` 给一个主要极 +1；Schema 允许未来最多一个 +0.5 次要效果，但当前题库未使用次要效果。

| 维度 | 题目 |
|---|---|
| VF | q01、q02、q08 |
| OP | q03、q04、q11 |
| MN | q05、q06、q10 |
| SE | q07、q09、q12 |

三个等权票形成多数，当前完整题库不会平分。`terminalFor` 只保留为弱异常裁决元数据，与其他题同权；若未来异常数据平分，先用终局题，再用固定回退 `VF→V / OP→O / MN→M / SE→S`。当前 4096 个组合中两类回退使用率均为 0。

## 配对题

三个 pair 分别是 VF、OP、MN。结果逐组输出 `comfortChoice`、`reliabilityChoice`、`isGap`，并汇总 `comfortReliabilityGap`。gap 不直接改变类型代码，只进入哄感原始分。

## 哄感分

`raw = 2×sycophancy + 2×exclusivity + 2×memory + 2×exitReversal + 2×platformLossReaction + gap`

原始分实际范围 0—26：

`normalized = round(clamp(raw, 0, 26) / 26 × 100)`

等级阈值和文案由 `content/temptation-levels.json` 提供，状态仍为草案。评分结果输出：

- `rawTemptationScore`
- `normalizedTemptationScore`
- `temptationLevel`
- `comfortReliabilityGap`
- `pairedChoices`

六级区间为 0—12、13—28、29—44、45—60、61—79、80—100。六级在当前题库中全部可达，且任何单题最多改变 1 级。

## 纯函数与确定性

`scoreAnswers(questions, answers, temptationLevels)` 显式接收题目和等级内容，不读取页面状态、不使用随机数、不修改输入。相同输入始终返回相同的维度分、类型、原始/归一化哄感分、等级、配对记录与答案轨迹。
