# AITI Conference Edition 部署指南

## 必需环境变量

在部署平台配置以下公开构建变量，然后重新构建：

```text
NEXT_PUBLIC_SITE_URL=https://你的正式网站地址
NEXT_PUBLIC_VOTE_URL=https://你的正式投票地址
```

两个值都必须是完整的 HTTP(S) 地址。网站地址用于 `/poster` 和分享卡二维码；投票地址用于结果页、研究页和Demo页。缺少配置时页面不会跳转空地址，也不会生成错误二维码。

## GitHub Pages

1. 在仓库 Settings → Pages 中选择 GitHub Actions。
2. 在 Settings → Secrets and variables → Actions → Variables 新建 `NEXT_PUBLIC_SITE_URL` 与 `NEXT_PUBLIC_VOTE_URL`。
3. 将确认版本合并到 `main`，或手动运行 `Deploy mobile playtest` 工作流。
4. 工作流会执行 `npm ci --legacy-peer-deps` 与生产构建，并上传 `out/`。
5. 部署后依次打开 `/`、`/poster`、`/demo` 和 `/result` 完成实体手机检查。

如果部署在项目子路径，`NEXT_PUBLIC_SITE_URL` 必须包含完整子路径。

## 其他Next.js平台

1. 使用 Node.js 24。
2. 安装依赖：`npm ci --legacy-peer-deps`。
3. 配置两个公开环境变量。
4. 构建：`npm run build`。
5. 启动：`npm run start`；静态托管平台则按平台要求启用导出配置。

## 发布验证

```text
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

不要把 `.env` 提交到仓库。`.env.example` 只包含占位格式。

## 回滚

回滚到上一个已通过全部检查的提交并重新部署。不要只回滚题目JSON或评分文件中的一个；三类版本号必须与内容和评分实现共同发布，防止旧本地答案套用新规则。
