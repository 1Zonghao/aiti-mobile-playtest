# 内容与状态版本

- `contentVersion`: `aiti-content-v1`
- `scoringVersion`: `aiti-scoring-v1`
- `appVersion`: `1.0.0-conference`
- 本地存储键：`aiti-playtest-v1`

新会话保存三个版本。持久化状态只有在三个版本全部相等时才恢复；任一不一致都会清除旧会话答案并提示内容已更新。本地反馈和匿名本机计数可保留，不会套用到新评分。

题目与哄感公式没有明确人工批准记录，继续保持 `DRAFT_REQUIRES_HUMAN_REVIEW`。
