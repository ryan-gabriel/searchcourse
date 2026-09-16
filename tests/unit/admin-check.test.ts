import { describe, expect, it } from 'vitest';
import { hasAdminClaim } from '@/lib/admin-check';

describe('hasAdminClaim', () => {
    it('returns true only for is_admin set in app_metadata', () => {
        expect(hasAdminClaim({ app_metadata: { is_admin: true } })).toBe(true);
    });

    it('ignores a client-writable is_admin in user_metadata', () => {
        const forged = {
            app_metadata: null,
            user_metadata: { is_admin: true },
        };
        expect(hasAdminClaim(forged)).toBe(false);
    });

    it('ignores app_metadata without an admin claim', () => {
        expect(hasAdminClaim({ app_metadata: { is_admin: false } })).toBe(false);
        expect(hasAdminClaim({ app_metadata: {} })).toBe(false);
    });

    it('returns false for missing or malformed users', () => {
        expect(hasAdminClaim(null)).toBe(false);
        expect(hasAdminClaim(undefined)).toBe(false);
        expect(hasAdminClaim({})).toBe(false);
    });
});