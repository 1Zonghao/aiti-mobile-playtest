# Phase 2 角色资产

## 资产接口

统一映射位于 `src/lib/character-assets.ts`，目标路径为：

`public/characters/{voms|vome|vons|vone|vpms|vpme|vpns|vpne|foms|fome|fons|fone|fpms|fpme|fpns|fpne}.webp`

组件不手写图片路径。正式图接入后由映射声明 `official: true`，使用 `next/image`、中文类型名 alt、响应式 `sizes`；结果首图优先，其余默认懒加载。

## 当前盘点

- 正式插画：0 / 16。
- 使用统一占位视觉：16 / 16。
- 首发8型 VOMS、VOME、VONS、VPNS、FOMS、FONE、FPMS、FPME 当前也仍为占位。
- `public/characters/` 当前不存在，没有任何文件被冒充为正式图。

## 占位体系

占位角色包含几何小人、类型代码、主道具关键词、人格主色/稳定回退色与“平台暂时还没给它发身体”轻量说明。完整结果文案不被遮挡，页面不会请求不存在的图片，因此没有破图、“TODO”、“Coming soon”或错误页观感。

正式资产约束：WebP、角色与道具单体、不嵌入正文文字、暖白无影棚背景、全站固定头身比/光源/眼嘴组件。
