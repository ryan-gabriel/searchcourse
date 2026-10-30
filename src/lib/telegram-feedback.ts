/**
 * Telegram feedback command parsing.
 *
 * Users can send `/review <text>`, `/suggest <text>`, or a plain message
 * (treated as a suggestion). Kept pure so it can be unit tested without
 * touching the Telegram API or the database.
 */

export const TELEGRAM_FEEDBACK_MAX_LENGTH = 2000;
export const TELEGRAM_FEEDBACK_MIN_LENGTH = 3;

export interface ParsedTelegramFeedback {
  type: 'REVIEW' | 'SUGGESTION';
  text: string;
}

const COMMAND_PATTERN = /^\/(review|suggest)(?:@[A-Za-z0-9_]+)?(?:\s+([\s\S]*))?$/i;

export function parseTelegramFeedback(input: string): ParsedTelegramFeedback | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(COMMAND_PATTERN);
  let type: ParsedTelegramFeedback['type'] = 'SUGGESTION';
  let text = trimmed;

  if (match) {
    type = match[1].toLowerCase() === 'review' ? 'REVIEW' : 'SUGGESTION';
    text = (match[2] ?? '').trim();
  } else if (trimmed.startsWith('/')) {
    // Unknown slash command — let the caller show usage help.
    return null;
  }

  if (text.length < TELEGRAM_FEEDBACK_MIN_LENGTH) return null;
  if (text.length > TELEGRAM_FEEDBACK_MAX_LENGTH) return null;

  return { type, text };
}

export function isTelegramStartCommand(text: string): boolean {
  return /^\/start(?:@[A-Za-z0-9_]+)?(?:\s|$)/i.test(text.trim());
}
