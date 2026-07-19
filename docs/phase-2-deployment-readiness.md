# 部署准备状态

Conference Edition的代码、16张正式角色图、静态页面、分享卡和大会Demo已经接入。核心页面不依赖数据库、账户、服务端图片生成或真实大模型。

正式部署仍须配置：

- `NEXT_PUBLIC_SITE_URL`：分享卡与 `/poster` 二维码。
- `NEXT_PUBLIC_VOTE_URL`：结果页、研究页与Demo投票入口。

未配置时会安全降级，不生成错误二维码，不跳转空地址。完整操作见 `docs/deployment-guide.md` 与 `docs/final-human-checklist.md`。
