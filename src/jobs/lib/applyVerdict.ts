/**
 * Maps a coupon verification verdict to the Prisma update to apply.
 * Pure so it can be unit-tested without a database connection.
 */

import type { CouponStatus } from "./verifyCoupon";

export interface ApplyVerdictOptions {
    now?: Date;
}

export interface VerdictUpdate {
    isActive?: false;
    verifiedAt?: Date;
}

export function applyVerdict(
    status: CouponStatus,
    opts: ApplyVerdictOptions = {},
): VerdictUpdate | null {
    switch (status) {
        case "VALID":
            return { verifiedAt: opts.now ?? new Date() };
        case "INVALID":
            return { isActive: false };
        case "UNDETERMINED":
            return null;
    }
}

/**
 * Track a run of consecutive coupon pages flagged as blocked by bot
 * protection. Increments on blocked, resets to 0 otherwise.
 */
export function nextBlockedStreak(streak: number, blocked: boolean): number {
    return blocked ? streak + 1 : 0;
}