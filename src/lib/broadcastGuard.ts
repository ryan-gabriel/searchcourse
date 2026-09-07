export interface BroadcastCouponGuardInput {
    expiresAt: Date | null;
    verifiedAt?: Date | null;
    minExpiryHours?: number;
    maxVerifiedAgeHours?: number;
    now?: Date;
}

/**
 * Broadcast eligibility guard for Telegram coupons.
 *
 * Rejects a coupon when:
 * - it expires within `minExpiryHours` (default 12h) of now, or
 * - it was last verified (feed `savedtime` >= `maxVerifiedAgeHours` ago)
 *   (default 24h), i.e. the feed snapshot it came from is stale.
 *
 * A null `expiresAt` (no expiration advertised) and a null `verifiedAt`
 * (unknown freshness) are treated as pass-through.
 */
export function shouldBroadcastCoupon(input: BroadcastCouponGuardInput): boolean {
    const {
        expiresAt,
        verifiedAt,
        minExpiryHours = 12,
        maxVerifiedAgeHours = 24,
    } = input;

    const nowMs = (input.now ?? new Date()).getTime();
    const minExpiryMs = minExpiryHours * 3600_000;
    const maxVerifiedAgeMs = maxVerifiedAgeHours * 3600_000;

    if (expiresAt !== null && expiresAt.getTime() <= nowMs + minExpiryMs) {
        return false;
    }

    if (verifiedAt !== null && verifiedAt !== undefined && verifiedAt.getTime() < nowMs - maxVerifiedAgeMs) {
        return false;
    }

    return true;
}