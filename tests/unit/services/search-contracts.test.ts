import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    course: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    coupon: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    roadmap: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    siteSettings: {
      upsert: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { searchCourses, getCourseBySlug } from "@/services/course.service";
import { searchCoupons } from "@/services/coupon.service";
import { searchRoadmaps } from "@/services/roadmap.service";
import {
  getSiteSettings,
  updateSiteSettings,
  getAboutPageStats,
  getHomepageStats,
  getMissionContent,
  SETTINGS_ID,
} from "@/services/settings.service";

const courseFindMany = vi.mocked(prisma.course.findMany as unknown as ReturnType<typeof vi.fn>);
const courseCount = vi.mocked(prisma.course.count as unknown as ReturnType<typeof vi.fn>);
const courseFindUnique = vi.mocked(prisma.course.findUnique as unknown as ReturnType<typeof vi.fn>);
const couponFindMany = vi.mocked(prisma.coupon.findMany as unknown as ReturnType<typeof vi.fn>);
const couponCount = vi.mocked(prisma.coupon.count as unknown as ReturnType<typeof vi.fn>);
const roadmapFindMany = vi.mocked(prisma.roadmap.findMany as unknown as ReturnType<typeof vi.fn>);
const roadmapCount = vi.mocked(prisma.roadmap.count as unknown as ReturnType<typeof vi.fn>);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("searchCoupons (schema/service contract)", () => {
  it("applies the default notExpired filter (no expired coupons)", async () => {
    couponFindMany.mockResolvedValue([] as never);
    couponCount.mockResolvedValue(0 as never);

    await searchCoupons({ page: 1, limit: 20 });

    const findMany = couponFindMany.mock.calls[0][0];
    expect(findMany).toMatchObject({
      orderBy: [{ createdAt: "desc" }],
      skip: 0,
      take: 20,
    });
    const andClause = findMany.where.AND;
    expect(andClause).toBeDefined();
    expect(andClause[0].OR).toEqual([
      { expiresAt: null },
      { expiresAt: { gt: expect.any(Date) } },
    ]);
  });

  it("omits the expiry filter when notExpired is false", async () => {
    couponFindMany.mockResolvedValue([] as never);
    couponCount.mockResolvedValue(0 as never);

    await searchCoupons({ page: 1, limit: 20, notExpired: false });

    const findMany = couponFindMany.mock.calls[0][0];
    expect(findMany.where.AND).toBeUndefined();
    expect(findMany.where.expiresAt).toBeUndefined();
  });

  it("applies isActive, courseId and minDiscount filters", async () => {
    couponFindMany.mockResolvedValue([] as never);
    couponCount.mockResolvedValue(0 as never);

    await searchCoupons({ page: 1, limit: 20, isActive: false, courseId: "cou_1", minDiscount: 50 });

    const where = couponFindMany.mock.calls[0][0].where;
    expect(where.isActive).toBe(false);
    expect(where.courseId).toBe("cou_1");
    expect(where.discountValue).toEqual({ gte: 50 });
  });

  it("searches by query across code and course title", async () => {
    couponFindMany.mockResolvedValue([] as never);
    couponCount.mockResolvedValue(0 as never);

    await searchCoupons({ page: 1, limit: 20, query: "react" });

    const where = couponFindMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { code: { contains: "react", mode: "insensitive" } },
      { course: { title: { contains: "react", mode: "insensitive" } } },
    ]);
  });

  it("computes pagination, totalPages and hasNext/hasPrev", async () => {
    couponFindMany.mockResolvedValue([] as never);
    couponCount.mockResolvedValue(25 as never);

    const result = await searchCoupons({ page: 1, limit: 20, notExpired: false });

    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 25,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    });
  });

  it("maps rows to the CouponWithCourse DTO with numeric prices", async () => {
    couponFindMany.mockResolvedValue([
      {
        id: "c1",
        code: "CODE",
        discountType: "PERCENTAGE",
        discountValue: 100,
        finalPrice: 0,
        expiresAt: null,
        isActive: true,
        source: "scraped:test",
        verifiedAt: new Date("2026-01-01"),
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        course: {
          id: "cr1",
          title: "Course",
          slug: "course",
          originalPrice: 99,
        },
      },
    ] as never);
    couponCount.mockResolvedValue(1 as never);

    const result = await searchCoupons({ page: 1, limit: 20, notExpired: false });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: "c1",
      discountValue: 100,
      finalPrice: 0,
      course: { id: "cr1", originalPrice: 99 },
    });
  });
});

describe("searchRoadmaps (schema/service contract)", () => {
  const row = {
    id: "r1",
    title: "Web Dev",
    slug: "web-dev",
    subtitle: null,
    description: "A path",
    iconName: "Globe",
    estimatedHours: 10,
    sortOrder: 1,
    level: "BEGINNER",
    skillTags: ["react"],
    hasJobGuarantee: true,
    hasCertificate: false,
    hasFreeResources: true,
    isShortPath: false,
    category: { id: "cat1", name: "Dev", slug: "dev" },
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2026-01-01"),
    _count: { steps: 2 },
  };

  it("applies feature filter fields (job guarantee, certificate, resources, short path)", async () => {
    roadmapFindMany.mockResolvedValue([row] as never);
    roadmapCount.mockResolvedValue(1 as never);

    await searchRoadmaps({
      page: 1,
      limit: 10,
      hasJobGuarantee: true,
      hasCertificate: false,
      hasFreeResources: true,
      isShortPath: false,
    });

    const where = roadmapFindMany.mock.calls[0][0].where;
    expect(where.hasJobGuarantee).toBe(true);
    expect(where.hasCertificate).toBe(false);
    expect(where.hasFreeResources).toBe(true);
    expect(where.isShortPath).toBe(false);
  });

  it("applies query, isActive, isFeatured, level, category and hasCourses filters", async () => {
    roadmapFindMany.mockResolvedValue([row] as never);
    roadmapCount.mockResolvedValue(1 as never);

    await searchRoadmaps({
      page: 1,
      limit: 10,
      query: "web",
      isActive: true,
      isFeatured: false,
      level: "BEGINNER",
      category: "dev",
      hasCourses: true,
    });

    const where = roadmapFindMany.mock.calls[0][0].where;
    expect(where).toMatchObject({
      isActive: true,
      isFeatured: false,
      level: "BEGINNER",
      category: { slug: "dev" },
      steps: { some: {} },
    });
    expect(where.OR).toEqual([
      { title: { contains: "web", mode: "insensitive" } },
      { description: { contains: "web", mode: "insensitive" } },
    ]);
  });

  it("serializes the feature flags and category into the DTO", async () => {
    roadmapFindMany.mockResolvedValue([row] as never);
    roadmapCount.mockResolvedValue(1 as never);

    const result = await searchRoadmaps({ page: 1, limit: 10 });

    expect(result.data[0]).toMatchObject({
      id: "r1",
      courseCount: 2,
      level: "BEGINNER",
      skillTags: ["react"],
      hasJobGuarantee: true,
      hasCertificate: false,
      hasFreeResources: true,
      isShortPath: false,
      category: { id: "cat1", name: "Dev", slug: "dev" },
    });
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });
});

describe("searchCourses (schema/service contract)", () => {
  const courseRow = {
    id: "course1",
    title: "React Basics",
    slug: "react-basics",
    description: null,
    instructorName: null,
    thumbnailUrl: null,
    originalPrice: 99,
    currency: "USD",
    rating: null,
    reviewCount: 0,
    studentCount: 100,
    duration: null,
    directUrl: "https://udemy.com",
    affiliateUrl: null,
    isActive: true,
    isFeatured: false,
    isPosted: true,
    externalId: "ext-1",
    headline: null,
    language: null,
    lastVerifiedAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    platform: { id: "p1", name: "Udemy", slug: "udemy", logoUrl: null },
    category: { id: "cat1", name: "Dev", slug: "dev" },
    coupons: [],
  };

  it("filters by hasDiscount/maxPrice with an active coupon clause", async () => {
    courseFindMany.mockResolvedValue([courseRow] as never);
    courseCount.mockResolvedValue(1 as never);

    await searchCourses({ page: 1, limit: 12, sortBy: "date", sortOrder: "desc", hasDiscount: true, maxPrice: 50 });

    const where = courseFindMany.mock.calls[0][0].where;
    expect(where.coupons).toEqual({
      some: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
        finalPrice: { lte: 50 },
      },
    });
  });

  it("filters by minRating, platform slug and category slug", async () => {
    courseFindMany.mockResolvedValue([courseRow] as never);
    courseCount.mockResolvedValue(1 as never);

    await searchCourses({ page: 1, limit: 12, sortBy: "date", sortOrder: "desc", minRating: 4, platform: "udemy", category: "dev" });

    const where = courseFindMany.mock.calls[0][0].where;
    expect(where.rating).toEqual({ gte: 4 });
    expect(where.platform).toEqual({ slug: "udemy" });
    expect(where.category).toEqual({ slug: "dev" });
  });

  it("orders by price when sortBy is price", async () => {
    courseFindMany.mockResolvedValue([courseRow] as never);
    courseCount.mockResolvedValue(1 as never);

    await searchCourses({ page: 1, limit: 12, sortBy: "price", sortOrder: "asc" });

    const orderBy = courseFindMany.mock.calls[0][0].orderBy;
    expect(orderBy.originalPrice).toBe("asc");
  });

  it("maps course rows to CourseWithDetails (with null-safe activeCoupon)", async () => {
    courseFindMany.mockResolvedValue([
      { ...courseRow, coupons: [{ id: "cp1", code: "CODE", discountValue: 100, discountType: "PERCENTAGE", finalPrice: 0, expiresAt: null }] },
    ] as never);
    courseCount.mockResolvedValue(1);

    const result = await searchCourses({ page: 1, limit: 12, sortBy: "date", sortOrder: "desc" });

    expect(result.data[0]).toMatchObject({
      id: "course1",
      slug: "react-basics",
      originalPrice: 99,
      platform: { slug: "udemy" },
      activeCoupon: { id: "cp1", discountValue: 100, finalPrice: 0 },
    });
    expect(result.pagination).toEqual({
      page: 1, limit: 12, total: 1, totalPages: 1, hasNext: false, hasPrev: false,
    });
  });

  it("getCourseBySlug uses the shared active coupon where for its include", async () => {
    courseFindUnique.mockResolvedValue(null);

    await getCourseBySlug("react-basics");

    const args = courseFindUnique.mock.calls[0][0] as {
      where: Record<string, unknown>;
      include: { coupons: { where: { isActive: boolean; OR: unknown[] } } };
    };
    expect(args.where).toEqual({ slug: "react-basics", isActive: true });
    expect(args.include.coupons.where.isActive).toBe(true);
    expect(args.include.coupons.where.OR).toEqual([
      { expiresAt: null },
      { expiresAt: { gt: expect.any(Date) } },
    ]);
  });
});

describe("settings service (contract)", () => {
    const mockedUpsert = vi.mocked(
        prisma.siteSettings.upsert as unknown as ReturnType<typeof vi.fn>
    );

    it("getSiteSettings upserts the singleton row", async () => {
        mockedUpsert.mockResolvedValue({ id: SETTINGS_ID });

        await getSiteSettings();

        expect(mockedUpsert).toHaveBeenCalledWith({
            where: { id: SETTINGS_ID },
            update: {},
            create: { id: SETTINGS_ID },
        });
    });

    it("updateSiteSettings writes the same data to update and create", async () => {
        const data = { coursesVerified: "1200", acceptanceRate: "10%" };
        mockedUpsert.mockResolvedValue({ id: SETTINGS_ID, ...data });

        await updateSiteSettings(data);

        expect(mockedUpsert).toHaveBeenCalledWith({
            where: { id: SETTINGS_ID },
            update: data,
            create: { id: SETTINGS_ID, ...data },
        });
    });

    it("maps settings rows into about/homepage/mission DTOs", async () => {
        mockedUpsert.mockResolvedValue({
            id: SETTINGS_ID,
            coursesVerified: "1200",
            studentSavings: "$1M",
            uptime: "99.9%",
            acceptanceRate: "10%",
            hostingCost: "$8",
            priceMonitoring: "daily",
            missionTitle: "T",
            missionSubtitle: "S",
            missionDescription: "D",
        });

        await expect(getAboutPageStats()).resolves.toEqual({
            coursesVerified: "1200",
            studentSavings: "$1M",
            uptime: "99.9%",
            acceptanceRate: "10%",
            hostingCost: "$8",
            priceMonitoring: "daily",
        });
        await expect(getHomepageStats()).resolves.toEqual({
            coursesVerified: "1200",
            studentSavings: "$1M",
            uptime: "99.9%",
        });
        await expect(getMissionContent()).resolves.toEqual({
            title: "T",
            subtitle: "S",
            description: "D",
        });
    });
});