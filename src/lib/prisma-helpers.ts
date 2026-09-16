import { Prisma } from "@prisma/client";

export const notExpiredCouponClause = (): Prisma.CouponWhereInput[] => [
  { expiresAt: null },
  { expiresAt: { gt: new Date() } },
];

export const activeCouponWhere = (): Prisma.CouponWhereInput => ({
  isActive: true,
  OR: notExpiredCouponClause(),
});