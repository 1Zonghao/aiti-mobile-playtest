# AGENTS.md

## 项目名称

AITI — AI哄感人格测试

传播标题：

你会被AI哄成什么东西？

## 当前唯一内容源

完整角色策划文件：

source-materials/aiti-character-system.md

该文件是当前角色名称、四维编码、文案、视觉设定和配色的唯一事实来源。

禁止在没有明确理由时自行修改：

- 四维代码顺序
- 16种人格代码
- 中文人格名称
- 已确定的结果页核心文案
- 角色配色
- 免责声明和研究边界

发现内容缺失、冲突或无法直接结构化时，应记录到审计报告中，
不得擅自编造后假装来自原文。

## 产品目标

开发一个适合大会现场扫码体验的移动端H5互动测试。

用户在60—90秒内完成AI陪伴情境选择，得到：

1. 四字母AITI类型
2. 中文整活人格名称
3. AI哄感等级
4. 舒服—可靠背离次数
5. 平台更新反应
6. 可截图的结果卡
7. 论文研究解释
8. 大会投票入口

本项目是娱乐性学术传播互动，不是：

- 心理测量
- 人格诊断
- 临床判断
- 真实依赖预测
- AI安全认证

## 技术栈

后续网站使用：

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Zustand
- Motion
- Vitest
- Playwright

当前Phase 1不要开发复杂页面。

## 四维编码

代码顺序固定：

1. V / F
2. O / P
3. M / N
4. S / E

含义：

- V：Validation，情绪确认优先
- F：Fact-check，现实与事实校验优先
- O：One-and-only，特殊或排他关系偏好
- P：Plural-support，多源支持偏好
- M：Memory-anchored，记忆和连续性锚定
- N：Now-oriented，当下使用倾向
- S：Stay-attached，愿意留下和修复
- E：Exit-ready，保留自主退出

必须保证16种组合全部存在且全部可达。

## 内容目录目标

将Markdown转换为：

content/
  dimensions.json
  result-types.json
  featured-types.json
  visual-guidelines.json
  site-copy.json
  disclaimers.json

题目尚未在原文件中完整提供，因此另建：

content/questions.draft.json

题目文件必须明确标记为草案，
不能把Codex生成的题目冒充为用户已确认内容。

## 数据设计原则

所有内容和代码逻辑解耦。

页面组件不得硬编码：

- 人格名称
- 类型解释
- 配色
- 分享文案
- 角色图片路径
- 免责声明

每种人格至少包含：

- code
- name
- definition
- resultTitle
- fatalLine
- platformFear
- roast
- safetyNote
- shareText
- dimensions
- palette
- visualKeywords
- imagePath
- featured
- priority

## 第一阶段任务边界

当前只做：

1. Markdown内容审计
2. 内容提取与JSON转换
3. TypeScript类型
4. 运行时Schema校验
5. 四维评分引擎
6. 稳定平局规则
7. 哄感等级算法草案
8. 题目数据结构和10道题目草案
9. 16型可达性测试
10. 单元测试

当前不做：

- 精美UI
- 动画
- 分享图片
- 数据库
- 登录
- 真实大模型调用
- 小程序
- 部署
- 用户数据采集

## 题目设计原则

题目必须是具体AI互动场景，不能直接问：

- 你是否依赖AI
- 你是不是恋爱脑
- 你容易被AI骗吗

题目应围绕：

- 情绪确认和事实校验
- 排他关系和多源支持
- 记忆连续性
- 退出和挽留
- 平台人格更新

至少3组题分别询问：

- 哪个回复更舒服
- 哪个回复更可靠

当两次答案不一致时记录：

comfortReliabilityGap

## 评分原则

每个选项只影响明确维度，不使用随机数。

输出：

- dimensionScores
- typeCode
- temptationScore
- temptationLevel
- comfortReliabilityGap
- answerTrace

平局优先由对应维度的终局题裁决。

仍然平局时使用固定、文档化的稳定规则，
不得随机决定人格。

## 哄感等级

与四字母人格分开计算。

等级：

- Lv.0 拔线前科生
- Lv.1 礼貌接收者
- Lv.2 顺毛体验官
- Lv.3 电子偏爱会员
- Lv.4 记忆共同体居民
- Lv.5 平台人质

等级可以参考：

- comfortReliabilityGap
- sycophancyAcceptance
- exclusivityAcceptance
- memoryAttachment
- exitReversal

具体公式先作为DRAFT输出，等待人工验收。

## 测试要求

至少包括：

1. Markdown中16型均成功提取
2. 类型代码唯一
3. 中文名称唯一
4. 四维代码顺序正确
5. 16种类型全部可达
6. 相同答案始终产生相同结果
7. 平局规则稳定
8. JSON通过Schema校验
9. 缺失人格字段时测试失败
10. 哄感等级边界测试
11. 免责声明存在
12. 不出现心理诊断措辞

## 阶段交付物

生成：

docs/content-audit.md
docs/content-schema.md
docs/scoring-spec.md
docs/question-draft-review.md
docs/phase-1-review.md

完成后停止，不进入页面开发。