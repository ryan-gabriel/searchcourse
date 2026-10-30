/**
 * Telegram webhook authorization.
 *
 * Telegram echoes the `secret_token` passed to setWebhook in the
 * X-Telegram-Bot-Api-Secret-Token header. Fails closed when the secret is
 * not configured so an unauthenticated caller can never write feedback.
 */

export function isTelegramWebhookAuthorized(headerValue: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!headerValue) return false;
  if (headerValue.length !== secret.length) return false;

  // Constant-time-ish comparison to avoid trivial timing leaks.
  let diff = 0;
  for (let i = 0; i < headerValue.length; i++) {
    diff |= headerValue.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}
