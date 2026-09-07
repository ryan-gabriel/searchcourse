import { describe, it, expect } from "vitest";
import { escapeMarkdown, formatDiscount, formatPrice, formatCourseMessage } from "@/lib/telegramFormat";

describe("escapeMarkdown (MarkdownV2 reserved characters)", () => {
  const reserved = "_*[]()~`>#+-=|{}.!\\";

  it("escapes every MarkdownV2 reserved character", () => {
    for (const char of reserved) {
      expect(escapeMarkdown(`a${char}b`)).toBe(`a\\${char}b`);
    }
  });

  it("escapes the '.' that broke Telegram broadcasts", () => {
    expect(escapeMarkdown("4.5")).toBe("4\\.5");
    expect(escapeMarkdown("v2.0!")).toBe("v2\\.0\\!");
  });
});

describe("formatPrice", () => {
  it("returns FREE for zero", () => {
    expect(formatPrice(0)).toBe("FREE");
  });

  it("formats two decimals with a dollar sign", () => {
    expect(formatPrice(9.99)).toBe("$9.99");
  });
});

describe("formatDiscount", () => {
  it("rounds and appends percent off", () => {
    expect(formatDiscount(90)).toBe("90% off");
    expect(formatDiscount(89.6)).toBe("90% off");
  });
});

describe("formatCourseMessage", () => {
  const baseCourse = {
    title: "Microsoft Excel: Basics (v2.0!)",
    slug: "microsoft-excel-basics",
    instructorName: "Jane A. Doe",
    originalPrice: 99.99,
    rating: 4.5,
    studentCount: 500,
    language: "English",
    category: { name: "Office Productivity" },
    coupons: [
      {
        finalPrice: 9.99,
        discountValue: 90,
        expiresAt: new Date(Date.now() + 24 * 3600000),
        code: "EXCEL90",
      },
    ],
  };

  it("renders the title wrapped in bold with all reserved characters escaped", () => {
    const message = formatCourseMessage(baseCourse);
    expect(message).toContain("🎓 *Microsoft Excel: Basics \\(v2\\.0\\!\\)*");
  });

  it("escapes the rating decimal, the original broadcast failure", () => {
    const message = formatCourseMessage(baseCourse);
    expect(message).toContain("4\\.5");
  });

  it("escapes price, discount, instructor, and category dots", () => {
    const message = formatCourseMessage(baseCourse);
    expect(message).toContain("~~$99\\.99~~");
    expect(message).toContain("*$9\\.99*");
    expect(message).toContain("\\(90% off\\)");
    expect(message).toContain("Jane A\\. Doe");
  });

  it("includes the branded link and expires line", () => {
    const message = formatCourseMessage(baseCourse);
    expect(message).toContain("[Get this course](https://searchcourse.com/go/microsoft-excel-basics)");
    expect(message).toContain("*Expires in 24h*");
  });

  it("omits rating/price/instructor lines for a minimal course", () => {
    const message = formatCourseMessage({
      title: "Plain title",
      slug: "plain-title",
      instructorName: null,
      originalPrice: 0,
      rating: null,
      studentCount: 0,
      language: null,
      category: null,
      coupons: [],
    });
    expect(message).not.toContain("rating");
    expect(message).not.toContain("$");
    expect(message).toContain("🎓 *Plain title*");
  });
});