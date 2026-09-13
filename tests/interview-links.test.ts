import { describe, expect, test } from "bun:test";
import { backTarget, problemHref } from "@/lib/problemLinks";

describe("interview track origins", () => {
  test("problems opened from a track return to that track", () => {
    expect(backTarget("/interview/anthropic")).toEqual({
      href: "/interview/anthropic",
      label: "Back to track",
    });
    expect(
      backTarget("/interview/machine-learning-engineer-general"),
    ).toEqual({
      href: "/interview/machine-learning-engineer-general",
      label: "Back to track",
    });
  });

  test("the interview index keeps its generic label", () => {
    expect(backTarget("/interview")).toEqual({
      href: "/interview",
      label: "Back to interview prep",
    });
  });

  test("problem links encode the track origin", () => {
    expect(problemHref("dl-001", "/interview/anthropic")).toBe(
      "/problems/dl-001?from=%2Finterview%2Fanthropic",
    );
  });
});
