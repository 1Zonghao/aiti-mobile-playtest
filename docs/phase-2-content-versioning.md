# Phase 2 内容与状态版本

## 当前版本

- `contentVersion`: `2026.07.18`
- `scoringVersion`: `1.0.0`
- `appVersion`: `2.0.0`
- 本地存储键：`aiti-playtest-v1`（保留旧键以检测并安全失效旧状态）

每个新会话同时写入三个版本。Zustand 持久化合并时只有三个版本全部相等才恢复答案、当前题号、平台更新选择、结果与完成状态。任一版本不一致时，旧测试进度不会套用新评分；系统保留本地反馈与匿名计数，清空会话并显示“内容版本已更新，请重新开始”。

## 保存字段

- 当前题号与答案
- 平台更新选择
- 结果摘要与是否完成
- 开始/完成时间
- 本地反馈记录
- 三个版本字段
- 可关闭的本地匿名计数

本地计数只包含完成次数、类型、哄感等级、研究入口点击和投票入口点击。它不上传服务器，不包含 IP、设备指纹、精确位置、微信身份或自由文本。

## 内容批准状态

- 16型代码、中文名称与当前结果字段按仓库最新人工修订内容使用，没有回滚。
- `content/questions.draft.json` 仍标记 `DRAFT_REQUIRES_HUMAN_REVIEW`；Phase 2 未擅自改写题目文案。
- `content/temptation-levels.json` 与哄感公式仍标记 `DRAFT_REQUIRES_HUMAN_REVIEW`；评分公式未修改。
- 8个非首发类型的若干 `resultTitle`、`safetyNote`、`shareText`、十六进制配色仍为 `MISSING`。页面使用原始定义或统一研究边界，不伪造确认文案。
