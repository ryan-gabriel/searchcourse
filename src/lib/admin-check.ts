/**
 * Pure admin-claim check.
 *
 * Admin status lives in `app_metadata.is_admin`, which only the Supabase
 * Admin API / dashboard can set. `user_metadata` is client-writable via
 * `supabase.auth.updateUser`, so it must never be trusted for authorization.
 *
 * Kept dependency-free so it is safe to import from the Next proxy (edge)
 * and unit-testable without mocks.
 */

export interface AuthUserLike {
  app_metadata?: Record<string, unknown> | null;
}

export function hasAdminClaim(
  user: AuthUserLike | null | undefined
): boolean {
  return user?.app_metadata?.is_admin === true;
}