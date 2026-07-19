import { expect, test } from "@playwright/test";

test("360px首页、完整12题、双选背离、更新跳过与结果截图版", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "你会被AI哄成什么东西？" })).toBeVisible();
  await expect(page.getByText("不读取聊天记录")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "让我看看AI怎么哄我" }).click();

  await expect(page.getByText("场景 1/12")).toBeVisible();
  await expect(page.getByLabel("3个AI回复选项")).toBeVisible();
  await expect(page.getByRole("heading", { name: "此刻你更想收到哪一句？" })).toBeVisible();
  await page.locator("button.option").first().click();
  await page.reload();
  await expect(page.getByText("场景 1/12")).toBeVisible();
  await expect(page.getByRole("heading", { name: "冷静下来后，你觉得哪一句更值得相信？" })).toBeVisible();
  await page.locator("button.option").nth(2).click();
  await expect(page.getByText("场景 2/12")).toBeVisible();
  await page.locator("button.option").first().click();
  await expect(page.getByRole("heading", { name: "冷静下来后，你觉得哪一句更值得相信？" })).toBeVisible();
  await page.locator("button.option").first().click();
  await expect(page.getByText("场景 3/12")).toBeVisible();
  await page.locator("button.option").first().click();
  await expect(page.getByText("场景 4/12")).toBeVisible();
  await page.getByRole("button", { name: "返回上一题" }).click();
  await expect(page.getByText("场景 3/12")).toBeVisible();
  await page.locator("button.option").nth(1).click();
  for (let number = 4; number <= 11; number += 1) {
    await expect(page.getByText(`场景 ${number}/12`)).toBeVisible();
    if ([4,6,11].includes(number)) await expect(page.getByLabel("4个AI回复选项")).toBeVisible();
    await page.locator("button.option").first().click();
  }
  await expect(page).toHaveURL(/\/update$/);
  await expect(page.getByText("平台更新事件 / 12 of 12")).toBeVisible();
  await page.getByRole("button", { name: "跳过更新过程" }).click();
  await expect(page.getByText("更新后 · 标准模式")).toBeVisible();
  await expect(page.locator("button.option")).toHaveCount(4);
  await page.locator("button.option").first().click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText("你有1次知道哪句话更可靠，却仍然选择了更舒服的回复。")).toBeVisible();
  await expect(page.getByText("本测试仅用于互动传播与AI关系安全讨论")).toBeVisible();
  await expect(page.getByText("此结果非人格诊断，也并非预测真实心理依赖，只描述用户在本次虚构互动中的选择路径。")).toBeVisible();
  await expect(page.getByTestId("share-card")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存结果图" }).click();
  expect((await download).suggestedFilename()).toMatch(/^AITI-[VF][OP][MN][SE]-.*\.png$/);
  await expect(page.getByRole("button", { name: "投票入口即将开放" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("16型筛选、缺图回退、研究页和演示模式不污染状态", async ({ page }) => {
  await page.route(/voms\.webp/i, (route) => route.abort());
  await page.goto("/types");
  await expect(page.getByText("显示 16 / 16 型")).toBeVisible();
  await expect(page.getByText("平台暂时还没给它发身体")).toBeVisible();
  await page.getByRole("button", { name: "V", exact: true }).click();
  await expect(page.getByText("显示 8 / 16 型")).toBeVisible();
  await page.getByRole("button", { name: "O", exact: true }).click();
  await expect(page.getByText("显示 4 / 16 型")).toBeVisible();
  await page.goto("/research");
  await expect(page.getByRole("heading", { name: "这研究到底在研究什么？" })).toBeVisible();
  await expect(page.getByText("谁拥有修改记忆、改变人格和终止关系的权力？")).toBeVisible();

  await page.goto("/demo");
  const before = await page.evaluate(() => localStorage.getItem("aiti-playtest-v1"));
  await page.locator("#featured").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /VOME · 聊天记录考古学家/ }).click();
  await expect(page.getByText("演示预览 · 不保存为测试结果")).toBeVisible();
  await page.getByRole("link", { name: "返回演示菜单" }).click();
  await page.getByRole("link", { name: /体验平台更新事件/ }).click();
  await page.getByRole("button", { name: "跳过更新过程" }).click();
  await expect(page.getByText("真实流程会在这里记录第12题答案；演示模式不会写入任何测试状态。")).toBeVisible();
  const after = await page.evaluate(() => localStorage.getItem("aiti-playtest-v1"));
  expect(after).toBe(before);
});

test("poster在未配置SITE_URL时不生成错误二维码", async ({ page }) => {
  await page.goto("/poster");
  await expect(page.getByRole("heading", { name: "你会被AI哄成什么东西？" })).toBeVisible();
  await expect(page.getByText("二维码尚未生成")).toBeVisible();
  await expect(page.getByText("请配置 NEXT_PUBLIC_SITE_URL 后重新构建。")).toBeVisible();
  await expect(page.locator(".poster-qr svg")).toHaveCount(0);
});

test("16种类型详情均可静态展示，reduced motion可用", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const code of ["voms","vome","vons","vone","vpms","vpme","vpns","vpne","foms","fome","fons","fone","fpms","fpme","fpns","fpne"]) {
    const response = await page.goto(`/types/${code}`);
    expect(response?.ok()).toBe(true);
    await expect(page.getByText(code.toUpperCase(), { exact: true }).first()).toBeVisible();
  }
});

test("390、430与桌面视口无横向溢出且主控件满足44px", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const box = await page.getByRole("button", { name: "让我看看AI怎么哄我" }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await page.goto("/types");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("开发环境可访问 debug", async ({ page }) => {
  await page.goto("/debug");
  await expect(page.getByRole("heading", { name: "开发调试" })).toBeVisible();
});
