import { describe, expect, test } from "bun:test";
import {
  backTarget,
  problemHref,
  safeInternalPath,
} from "@/lib/problemLinks";

describe("safeInternalPath", () => {
  test("accepts internal paths", () => {
    expect(safeInternalPath("/projects")).toBe("/projects");
    expect(safeInternalPath("/paths/math-foundations")).toBe(
      "/paths/math-foundations",
    );
  });

  test("rejects external, protocol-relative, and malformed values", () => {
    expect(safeInternalPath("https://evil.example")).toBeNull();
    expect(safeInternalPath("//evil.example")).toBeNull();
    expect(safeInternalPath("/a\\b")).toBeNull();
    expect(safeInternalPath(`/a${String.fromCharCode(0)}b`)).toBeNull();
    expect(safeInternalPath("")).toBeNull();
    expect(safeInternalPath(null)).toBeNull();
    expect(safeInternalPath(`/${"a".repeat(300)}`)).toBeNull();
  });
});

describe("problemHref", () => {
  test("adds an encoded from parameter for safe origins", () => {
    expect(problemHref("proj-001", "/projects")).toBe(
      "/problems/proj-001?from=%2Fprojects",
    );
    expect(problemHref("la-001", "/paths/math-foundations")).toBe(
      "/problems/la-001?from=%2Fpaths%2Fmath-foundations",
    );
  });

  test("drops unsafe from parameters", () => {
    expect(problemHref("proj-001", "https://evil.example")).toBe(
      "/problems/proj-001",
    );
    expect(problemHref("proj-001", null)).toBe("/problems/proj-001");
  });
});

describe("backTarget", () => {
  test("labels project origins", () => {
    expect(backTarget("/projects")).toEqual({
      href: "/projects",
      label: "Back to projects",
    });
  });

  test("labels path and collection origins", () => {
    expect(backTarget("/paths/ml-from-scratch")).toEqual({
      href: "/paths/ml-from-scratch",
      label: "Back to path",
    });
    expect(backTarget("/collections/interview-prep-essentials")).toEqual({
      href: "/collections/interview-prep-essentials",
      label: "Back to collection",
    });
  });

  test("labels other catalog origins", () => {
    expect(backTarget("/speedrun").label).toBe("Back to Speedrun");
    expect(backTarget("/contests").label).toBe("Back to contests");
    expect(backTarget("/interview").label).toBe("Back to interview prep");
  });

  test("falls back to all problems for missing or unsafe origins", () => {
    expect(backTarget(null)).toEqual({
      href: "/problems",
      label: "All problems",
    });
    expect(backTarget("https://evil.example")).toEqual({
      href: "/problems",
      label: "All problems",
    });
  });
});
