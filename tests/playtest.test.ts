import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { questionsContent, resultTypesContent, temptationLevelsContent } from "../src/content.js";
import { completionTimeSeconds, createEmptySession, createPlaytestRecord, isDebugEnabled, orderedAnswers, recordsToCsv } from "../src/playtest.js";
import type { PlaytestFeedback } from "../src/playtest.js";
import { scoreAnswers } from "../src/scoring.js";

function firstOptionAnswers(): Record<string, string> {
  return Object.fromEntries(questionsContent.questions.map((question) => [question.id, question.options[0].id]));
}

describe("Phase 1.5C 试玩流程核心", () => {
  it("12 题完整流程可以评分，并在修改旧答案后重新评分", () => {
    const map = firstOptionAnswers();
    const ids = questionsContent.questions.map((question) => question.id);
    const first = scoreAnswers(questionsContent.questions, orderedAnswers(ids, map), temptationLevelsContent);
    const question = questionsContent.questions[0];
    if (!question) throw new Error("题库为空。");
    map[question.id] = question.options[1].id;
    const changed = scoreAnswers(questionsContent.questions, orderedAnswers(ids, map), temptationLevelsContent);
    expect(first.answerTrace).toHaveLength(12);
    expect(changed.dimensionScores).not.toEqual(first.dimensionScores);
  });

  it("会话快照保留答案供刷新恢复，空会话用于重新测试清除状态", () => {
    const snapshot = { ...createEmptySession(), anonymousSessionId: "anonymous-1", startedAt: 1000, answers: firstOptionAnswers() };
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
    expect(Object.keys(createEmptySession().answers)).toHaveLength(0);
    expect(createEmptySession().anonymousSessionId).toBeNull();
  });

  it("16 种结果与 6 个哄感等级都有可显示内容", () => {
    expect(resultTypesContent.types).toHaveLength(16);
    for (const result of resultTypesContent.types) {
      expect(result.code).toHaveLength(4);
      expect(result.name).toBeTruthy();
      expect(result.definition).toBeTruthy();
      expect(result.fatalLine).toBeTruthy();
      expect(result.platformFear).toBeTruthy();
      expect(result.roast).toBeTruthy();
    }
    expect(temptationLevelsContent.levels.map((item) => item.level)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("反馈记录仅使用匿名会话字段，并可导出合法 CSV", () => {
    const answers = orderedAnswers(questionsContent.questions.map((question) => question.id), firstOptionAnswers());
    const score = scoreAnswers(questionsContent.questions, answers, temptationLevelsContent);
    const feedback: PlaytestFeedback = {
      completionTimeSeconds: 90,
      resultType: score.typeCode,
      temptationLevel: score.temptationLevel,
      comfortReliabilityGap: score.comfortReliabilityGap,
      hardestQuestionId: questionsContent.questions[0]?.id ?? "",
      obviousSafeAnswerQuestionIds: [],
      unrealisticOptionQuestionIds: [],
      resultAccuracyRating: 3,
      offensivenessRating: 1,
      willingToScreenshot: "yes",
      willingToReadResearch: "yes",
      willingToVote: "no",
      optionalComment: "本地反馈，包含逗号。"
    };
    const record = createPlaytestRecord({ anonymousSessionId: "anonymous-1", answers: firstOptionAnswers(), startedAt: 0, completedAt: 90_000 }, score, feedback, "2026-07-18T00:00:00.000Z");
    const csv = recordsToCsv([record]);
    expect(csv).toContain("anonymousSessionId,timestamp,completionTime");
    expect(csv).toContain("anonymous-1");
    expect(JSON.stringify(record)).not.toMatch(/name|phone|wechat|fingerprint|ipAddress|location/i);
    expect(completionTimeSeconds(0, 90_000)).toBe(90);
  });

  it("debug 只在 development 环境启用", () => {
    expect(isDebugEnabled("development")).toBe(true);
    expect(isDebugEnabled("production")).toBe(false);
    expect(isDebugEnabled("test")).toBe(false);
  });

  it("正式页面不显示内部评分字段、不调用大模型且不采集身份", async () => {
    const regularFiles = ["app/page.tsx", "components/test-runner.tsx", "components/update-finale.tsx", "components/result-view.tsx", "components/feedback-form.tsx"];
    const source = (await Promise.all(regularFiles.map((filename) => readFile(resolve(filename), "utf8")))).join("\n");
    expect(source).not.toContain("rawTemptationScore");
    expect(source).not.toContain("normalizedTemptationScore");
    expect(source).not.toContain("dimensionScores");
    expect(source).not.toMatch(/openai|anthropic|chat\.completions|responses\.create/i);
    expect(source).not.toMatch(/name=["'](name|phone|mobile|wechat|location|fingerprint|ipAddress)["']/i);
  });
});
