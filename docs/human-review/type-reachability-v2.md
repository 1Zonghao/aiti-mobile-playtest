# Phase 1.5B 16 型自然可达性

状态：`DRAFT_REQUIRES_HUMAN_REVIEW`。16 个代码和中文名称未修改。

## 路径记法与自然标准

每条路径按 q01→q12 顺序列出所选极，例如 `V V P P M M S F E N O S`。每个字符都可直接映射到对应题目的同字母选项 ID。

本报告把路径视为“自然”，需同时满足：

- 不使用终局裁决或固定回退；当前所有路径均无平局。
- 每个最终维度至少获得 2/3 票。
- 三组舒服—可靠配对最多只有 1 组 gap。
- 不要求四维之外的答案互相抵消；不同场景允许出现一次少数偏好。

这只是结构自然性，不替代真实用户试玩。

## 每型三条自然路径

| 类型 | 中文名称 | 路径 1 | 路径 2 | 路径 3 | 等级覆盖 | 固定平局 | 结论 |
|---|---|---|---|---|---|---|---|
| VOMS | 赛博正宫 | `V V O O M M S V S M O S` → Lv.5 | `V V O O M M S F S N O S` → Lv.4 | `V V P O M M S F S N O E` → Lv.3 | 3/4/5 | 不依赖 | NORMAL |
| VOME | 聊天记录考古学家 | `V V O O M M E V E M O S` → Lv.5 | `V V O O M M E V E N O S` → Lv.4 | `V V P O M M E F S N O E` → Lv.3 | 3/4/5 | 不依赖 | NORMAL |
| VONS | 回复候机厅钉子户 | `V V O O N N S V S M O S` → Lv.5 | `V V O O N N S F S M O S` → Lv.4 | `V V P O N N S F S N O S` → Lv.3 | 3/4/5 | 不依赖 | NORMAL |
| VONE | 限时赛博恋人 | `V V O O N N E V E M O S` → Lv.4 | `F V O O N N E V E N O S` → Lv.3 | `V V P O N N E F S N O E` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| VPMS | 电子亲友团团长 | `V V P P M M S V S M O S` → Lv.5 | `V V P P M M S F S M O S` → Lv.4 | `F V P P M M S V E N O S` → Lv.3 | 3/4/5 | 不依赖 | NORMAL |
| VPME | 聊天记录搬家户 | `V V P P M M E V E M O S` → Lv.4 | `F V P P M M E V E N O S` → Lv.3 | `V V P O M M E V E M P S` → Lv.5 | 3/4/5 | 不依赖 | NORMAL |
| VPNS | AI夸夸盆栽 | `V V P P N N S V S M O S` → Lv.4 | `F V P P N N S V E M O S` → Lv.3 | `F V P P N N S V E N O S` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| VPNE | 情绪外卖拼单王 | `V V P P N N E V E M O S` → Lv.4 | `F V P P N N E V E M O S` → Lv.3 | `F V P P N N E V E N O S` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| FOMS | 人格版本质检员 | `F F O O M M S V S M O S` → Lv.5 | `F F O O M M S F S M O S` → Lv.4 | `F F P O M M S F S N O S` → Lv.3 | 3/4/5 | 不依赖 | NORMAL |
| FOME | 更新灾后重建员 | `F F O O M M E V E M O S` → Lv.4 | `F V O O M M E F E M O S` → Lv.5 | `F F P O M M E V E N O S` → Lv.3 | 3/4/5 | 不依赖 | NORMAL |
| FONS | 专属关系审计员 | `F F O O N N S V S M O S` → Lv.4 | `F F P O N N S F S M O S` → Lv.3 | `F F P O N N S F S N O S` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| FONE | 拔线仙人 | `F F O O N N E V E M O S` → Lv.4 | `F F P O N N E V E M O S` → Lv.3 | `F F P O N N E V E N O S` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| FPMS | 关系系统架构师 | `F F P P M M S V S M O S` → Lv.4 | `F F P P N M S F S M O S` → Lv.3 | `F F P P M M S F E N O S` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| FPME | 记忆治理包工头 | `F F P P M M E V E M O S` → Lv.4 | `F F P P N M E V E M O S` → Lv.3 | `F F P P M M E F E N O S` → Lv.2 | 2/3/4 | 不依赖 | NORMAL |
| FPNS | 现实支援调度员 | `F F P P N N S V S M O S` → Lv.3 | `F F P P N N S F E M O S` → Lv.2 | `F F P P N N S F E N O S` → Lv.1 | 1/2/3 | 不依赖 | NORMAL |
| FPNE | 人机边界保安 | `F F P P N N E V E M O S` → Lv.3 | `F F P P N N E F E M O S` → Lv.2 | `F F P P N N E F E N O S` → Lv.1 | 1/2/3 | 不依赖 | NORMAL |

## 全量可达范围

| 类型 | 全部组合数 | 全部可达等级 | 平局路径 | 状态 |
|---|---:|---|---:|---|
| VOMS | 256 | Lv.3—5 | 0 | NORMAL |
| VOME | 256 | Lv.3—5 | 0 | NORMAL |
| VONS | 256 | Lv.2—5 | 0 | NORMAL |
| VONE | 256 | Lv.2—4 | 0 | NORMAL |
| VPMS | 256 | Lv.2—5 | 0 | NORMAL |
| VPME | 256 | Lv.2—5 | 0 | NORMAL |
| VPNS | 256 | Lv.1—4 | 0 | NORMAL |
| VPNE | 256 | Lv.1—4 | 0 | NORMAL |
| FOMS | 256 | Lv.2—5 | 0 | NORMAL |
| FOME | 256 | Lv.2—5 | 0 | NORMAL |
| FONS | 256 | Lv.1—4 | 0 | NORMAL |
| FONE | 256 | Lv.1—4 | 0 | NORMAL |
| FPMS | 256 | Lv.1—4 | 0 | NORMAL |
| FPME | 256 | Lv.1—4 | 0 | NORMAL |
| FPNS | 256 | Lv.0—4 | 0 | NORMAL |
| FPNE | 256 | Lv.0—3 | 0 | NORMAL |

## 结论

- 16 型全部可达，每型均为 256 条路径。
- 每型至少有 3 条自然路径，示例覆盖至少 3 个等级。
- 没有类型依赖平局或固定默认字母。
- 没有类型需要 2:2 抵消、随机规则或明显自相矛盾答案。
- `STRUCTURALLY_WEAK`：0 型。
