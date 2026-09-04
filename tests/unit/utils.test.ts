import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateDiscountPercentage, isCouponExpired } from "@/lib/utils";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("calculateDiscountPercentage", () => {
  it("returns 0 when originalPrice is 0", () => {
    expect(calculateDiscountPercentage(0, 0)).toBe(0);
  });

  it("returns 0 when originalPrice is negative", () => {
    expect(calculateDiscountPercentage(-100, 80)).toBe(0);
  });

  it("returns 0 when originalPrice is falsy (NaN)", () => {
    expect(calculateDiscountPercentage(NaN, 50)).toBe(0);
  });

  it("calculates a 50% discount", () => {
    expect(calculateDiscountPercentage(200, 100)).toBe(50);
  });

  it("calculates a 35% discount (2000→1299) rounded", () => {
    expect(calculateDiscountPercentage(2000, 1299)).toBe(35);
  });

  it("returns 0 when finalPrice equals originalPrice", () => {
    expect(calculateDiscountPercentage(100, 100)).toBe(0);
  });

  it("returns a negative percentage when finalPrice exceeds originalPrice", () => {
    expect(calculateDiscountPercentage(80, 100)).toBe(-25);
  });

  it("handles exact rounding at 0.5 boundary", () => {
    // 1/3 ≈ 33.33...% → rounds to 33
    expect(calculateDiscountPercentage(300, 200)).toBe(33);
    // 200/400 = 50%
    expect(calculateDiscountPercentage(400, 200)).toBe(50);
  });
});

describe("isCouponExpired", () => {
  it("returns false when expiresAt is null", () => {
    expect(isCouponExpired(null)).toBe(false);
  });

  it("returns true when expiresAt is in the past", () => {
    const past = new Date("2020-01-01");
    expect(isCouponExpired(past)).toBe(true);
  });

  it("returns false when expiresAt is in the future", () => {
    const future = new Date("2099-12-31");
    expect(isCouponExpired(future)).toBe(false);
  });

  it("returns true when expiresAt is exactly now (past by definition)", () => {
    const now = new Date(Date.now() - 1);
    expect(isCouponExpired(now)).toBe(true);
  });
});
