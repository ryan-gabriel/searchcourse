import { describe, it, expect } from "vitest";
import { buildPagination, paginate } from "@/lib/pagination";

describe("buildPagination", () => {
  it("computes totalPages, hasNext and hasPrev for a middle page", () => {
    expect(buildPagination(2, 10, 35)).toEqual({
      page: 2,
      limit: 10,
      total: 35,
      totalPages: 4,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("marks the first page as having no previous page", () => {
    expect(buildPagination(1, 20, 5)).toMatchObject({
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it("marks the last page as having no next page", () => {
    expect(buildPagination(3, 10, 25)).toMatchObject({
      totalPages: 3,
      hasNext: false,
      hasPrev: true,
    });
  });

  it("handles an empty result set", () => {
    expect(buildPagination(1, 10, 0)).toMatchObject({
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });
});

describe("paginate", () => {
  it("wraps data with the pagination meta", () => {
    expect(paginate(["a", "b"], 1, 2, 2)).toEqual({
      data: ["a", "b"],
      pagination: {
        page: 1,
        limit: 2,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  });
});
