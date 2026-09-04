import { describe, it, expect } from "vitest";
import { generateSlug, isValidSlug, generateUniqueSlug } from "@/lib/slug.utils";

describe("generateSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("trims leading/trailing whitespace", () => {
    expect(generateSlug("  hello  ")).toBe("hello");
  });

  it("strips punctuation", () => {
    expect(generateSlug("React & Next.js: The Guide!")).toBe("react-nextjs-the-guide");
  });

  it("strips diacritics (NFD normalization)", () => {
    expect(generateSlug("Crème Brûlée")).toBe("creme-brulee");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a   b")).toBe("a-b");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("strips leading/trailing hyphens", () => {
    expect(generateSlug(" - hello - ")).toBe("hello");
  });

  it("strips underscores (not treated as word separators)", () => {
    expect(generateSlug("hello_world")).toBe("helloworld");
  });
});

describe("isValidSlug", () => {
  it("returns true for a valid slug", () => {
    expect(isValidSlug("hello-world")).toBe(true);
  });

  it("returns true for slug with only lowercase and digits", () => {
    expect(isValidSlug("react101")).toBe(true);
  });

  it("returns false for slug shorter than 3 chars", () => {
    expect(isValidSlug("ab")).toBe(false);
  });

  it("returns false for slug with uppercase letters", () => {
    expect(isValidSlug("Hello-World")).toBe(false);
  });

  it("returns false for slug with spaces", () => {
    expect(isValidSlug("hello world")).toBe(false);
  });

  it("returns false for slug with special characters", () => {
    expect(isValidSlug("hello!")).toBe(false);
  });

  it("returns false for slug longer than 200 chars", () => {
    expect(isValidSlug("a".repeat(201))).toBe(false);
  });

  it("returns true for slug of exactly 200 chars", () => {
    expect(isValidSlug("a".repeat(200))).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidSlug("")).toBe(false);
  });
});

describe("generateUniqueSlug", () => {
  it("returns the base slug when no existing slugs conflict", () => {
    expect(generateUniqueSlug("hello-world", [])).toBe("hello-world");
  });

  it("appends -1 when base slug already exists", () => {
    expect(generateUniqueSlug("hello-world", ["hello-world"])).toBe("hello-world-1");
  });

  it("appends -2 when base and -1 exist", () => {
    expect(
      generateUniqueSlug("hello-world", ["hello-world", "hello-world-1"])
    ).toBe("hello-world-2");
  });

  it("skips gaps in existing numbering", () => {
    expect(
      generateUniqueSlug("hello-world", ["hello-world", "hello-world-2"])
    ).toBe("hello-world-1");
  });
});
