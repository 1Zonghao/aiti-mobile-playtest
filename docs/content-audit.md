# AITI Phase 1 内容审计

审计日期：2026-07-18  
唯一事实来源：`source-materials/aiti-character-system.md`

## 结论

原文的四维系统、16 种人格代码与中文名称完整且内部一致；8 个首发角色拥有可直接映射结果卡的完整文案与十六进制配色；统一视觉规范、站点核心文案和免责声明完整。题目、哄感等级公式、图片路径，以及另外 8 型的成品卡扩展字段尚未提供。

## 四维系统

| 位置 | 维度 | 两极 | 状态 |
|---|---|---|---|
| 1 | 回应方式 | V Validation / F Fact-check | CONFIRMED |
| 2 | 支持结构 | O One-and-only / P Plural-support | CONFIRMED |
| 3 | 连续性来源 | M Memory-anchored / N Now-oriented | CONFIRMED |
| 4 | 离场姿态 | S Stay-attached / E Exit-ready | CONFIRMED |

代码顺序固定为 `VF-OP-MN-SE`。原文的角色库、命名总表和优先视觉化顺序三处相互一致。

## 16 型与首发角色

16 个标准代码全部存在：`VOMS VOME VONS VONE VPMS VPME VPNS VPNE FOMS FOME FONS FONE FPMS FPME FPNS FPNE`。代码和中文名称均无重复。

首发 8 型为：`VOMS FONE VOME VPNS FOMS VONS FPME FPMS`。这 8 型具备结果页标题、18 字定义、致命台词、更新暴击、毒舌判词、安全彩蛋、4 个十六进制色值、出图关键词和分享文案。

## 配色、分享文案与视觉规范

- 16 型均有文字配色方向；仅首发 8 型有 4 个明确十六进制色值。
- 仅首发 8 型有已确认的分享文案与 `@朋友` 文案。
- 统一规范覆盖画风、构图、比例、背景、色彩、字体、卡片分区、结果结构、同宇宙约束和截图传播感。
- 画布、边距和分区比例明确：1080×1440 / 1080×1920，水平 72 px、垂直 64 px，12% / 55% / 25% / 8%。

## 缺失与草案

| 项目 | 状态 | 处理 |
|---|---|---|
| 非首发 8 型的结果页标题、安全彩蛋、分享文案 | MISSING | `null`，字段状态标记 `MISSING` |
| 非首发 8 型的十六进制配色 | MISSING | 保留原文颜色描述，`hex: null` |
| 全部 16 型的实际图片路径 | MISSING | `imagePath: null` |
| 完整题目 | DRAFT | 新建 `questions.draft.json`，状态固定为 `DRAFT_REQUIRES_HUMAN_REVIEW` |
| 哄感等级公式 | DRAFT | 单独实现并记录在评分规范，等待人工验收 |
| 题目用户研究、顺序效应与措辞测试 | MISSING | 未执行，列入人工复核 |

## 冲突检查

未发现代码、中文名称、首发名单、优先级、首发配色或已确认核心文案的冲突。原文第 03 节的长定义与第 06 节的“18 字定义”是不同使用场景，不视为冲突；首发类型在结构化结果中采用第 06 节成品卡字段。

## 研究边界

统一免责声明已原样结构化。内容定位是互动传播与 AI 关系安全讨论，不构成心理测量、临床判断或人格定论。结果与题目内容校验会排除诊断断言。
