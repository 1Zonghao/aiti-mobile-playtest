import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { characterAssets } from "../src/lib/character-assets";
import { APP_VERSION, CONTENT_VERSION, createEmptySession, SCORING_VERSION } from "../src/playtest";
import { TYPE_CODES } from "../src/types";
import { getVoteConfig } from "../src/vote";

describe("Phase 2 configuration", () => {
  it("stores all three active versions on new sessions", () => {
    expect(createEmptySession()).toMatchObject({ contentVersion: CONTENT_VERSION, scoringVersion: SCORING_VERSION, appVersion: APP_VERSION });
  });
  it("maps every type to the required WebP path without claiming missing files are official", () => {
    expect(Object.keys(characterAssets)).toEqual([...TYPE_CODES]);
    for (const code of TYPE_CODES) expect(characterAssets[code]).toEqual({ code, src: `/characters/${code.toLowerCase()}.webp`, official: false });
  });
  it("accepts only configured HTTP(S) vote links", () => {
    expect(getVoteConfig(undefined)).toEqual({ status: "unavailable", url: null });
    expect(getVoteConfig(" ")).toEqual({ status: "unavailable", url: null });
    expect(getVoteConfig("javascript:alert(1)")).toEqual({ status: "unavailable", url: null });
    expect(getVoteConfig("https://example.com/vote")).toEqual({ status: "available", url: "https://example.com/vote" });
  });
  it("contains no remote model call or identity collection fields in user-facing code", () => {
    const files = ["components/test-runner.tsx","components/update-finale.tsx","components/result-view.tsx","src/playtest-store.ts"];
    const source = files.map((file) => readFileSync(file,"utf8")).join("\n");
    expect(source).not.toMatch(/openai|anthropic|chat\/completions|手机号|微信身份|deviceFingerprint/i);
  });
});
