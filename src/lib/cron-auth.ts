/**
 * Shared auth guard for cron-job-triggered endpoints (/api/jobs/*).
 *
 * Protects scheduled job endpoints so only calls carrying the correct
 * CRON_SECRET (passed as a ?key= query param) can trigger expensive work.
 */

export function isCronAuthorized(key: string | null): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;
    if (!key) return false;
    // Constant-time-ish comparison to avoid trivial timing leaks.
    if (key.length !== secret.length) return false;
    let diff = 0;
    for (let i = 0; i < key.length; i++) {
        diff |= key.charCodeAt(i) ^ secret.charCodeAt(i);
    }
    return diff === 0;
}
