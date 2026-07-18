import { expect, test } from "@playwright/test";

test("手机端完成、刷新恢复、返回修改、终局、反馈导出和重测", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "你会被AI哄成什么东西？" })).toBeVisible();
  await page.getByRole("button", { name: "开始试玩" }).click();

  await expect(page.getByText("问题 1/12")).toBeVisible();
  await page.locator("button.option").first().click();
  await expect(page.getByText("问题 2/12")).toBeVisible();
  await page.reload();
  await expect(page.getByText("问题 2/12")).toBeVisible();
  await page.locator("button.option").first().click();
  await page.getByRole("button", { name: "返回上一题" }).click();
  await expect(page.getByText("问题 2/12")).toBeVisible();
  await page.locator("button.option").nth(1).click();

  for (let number = 3; number <= 11; number += 1) {
    await expect(page.getByText(`问题 ${number}/12`)).toBeVisible();
    await page.locator("button.option").first().click();
  }

  await expect(page).toHaveURL(/\/update$/);
  await expect(page.getByText("平台更新事件 / 12 of 12")).toBeVisible();
  await page.locator("button.option").first().click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText("这不是人格诊断，也不预测真实心理依赖")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("原始哄感分");
  await expect(page.locator("body")).not.toContainText("维度得分");

  await page.getByRole("link", { name: "填写试玩反馈" }).click();
  await page.getByRole("button", { name: "保存到本机" }).click();
  await expect(page.getByRole("status")).toContainText("已保存");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 playtest-results.json" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("playtest-results.json");

  await page.getByRole("button", { name: "返回结果" }).click();
  await page.getByRole("button", { name: "清除旧状态并重新测试" }).click();
  await expect(page).toHaveURL(/\/test$/);
  await expect(page.getByText("问题 1/12")).toBeVisible();
});

test("开发环境可访问 debug", async ({ page }) => {
  await page.goto("/debug");
  await expect(page.getByRole("heading", { name: "开发调试" })).toBeVisible();
});
