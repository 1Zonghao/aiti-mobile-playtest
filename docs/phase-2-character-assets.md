# 角色资产现状

16张正式原图位于 `characters/`，均为1600×2000透明PNG。`npm run assets:characters` 使用本地Sharp转换为高质量WebP，输出到 `public/characters/`，不删除或覆盖原图。

统一映射位于 `src/lib/character-assets.ts`，使用小写代码文件名。结果页当前角色优先加载，浏览页和Demo默认按需加载；图片使用中文人格名作为alt并保持完整比例。文件加载失败时切换到统一几何fallback。

当前正式插画：16 / 16。
