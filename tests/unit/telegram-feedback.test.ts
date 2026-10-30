import { describe, expect, it } from 'vitest';
import { isTelegramStartCommand, parseTelegramFeedback } from '@/lib/telegram-feedback';

describe('parseTelegramFeedback', () => {
  it('parses /review commands', () => {
    expect(parseTelegramFeedback('/review Great deals this week')).toEqual({
      type: 'REVIEW',
      text: 'Great deals this week',
    });
  });

  it('strips a bot username suffix from commands', () => {
    expect(parseTelegramFeedback('/review@SearchCourseBot Solid picks')).toEqual({
      type: 'REVIEW',
      text: 'Solid picks',
    });
  });

  it('parses /suggest commands', () => {
    expect(parseTelegramFeedback('/suggest Add more design courses')).toEqual({
      type: 'SUGGESTION',
      text: 'Add more design courses',
    });
  });

  it('treats plain text as a suggestion', () => {
    expect(parseTelegramFeedback('  The coupon page is confusing  ')).toEqual({
      type: 'SUGGESTION',
      text: 'The coupon page is confusing',
    });
  });

  it('rejects commands without a body', () => {
    expect(parseTelegramFeedback('/review')).toBeNull();
    expect(parseTelegramFeedback('/suggest   ')).toBeNull();
  });

  it('rejects unknown slash commands', () => {
    expect(parseTelegramFeedback('/help')).toBeNull();
  });

  it('rejects messages outside the length bounds', () => {
    expect(parseTelegramFeedback('hi')).toBeNull();
    expect(parseTelegramFeedback(`/review ${'a'.repeat(2001)}`)).toBeNull();
  });

  it('accepts messages at the maximum length', () => {
    const text = 'a'.repeat(2000);
    expect(parseTelegramFeedback(text)).toEqual({ type: 'SUGGESTION', text });
  });
});

describe('isTelegramStartCommand', () => {
  it('matches /start with an optional bot suffix', () => {
    expect(isTelegramStartCommand('/start')).toBe(true);
    expect(isTelegramStartCommand('/start@SearchCourseBot')).toBe(true);
  });

  it('does not match other commands', () => {
    expect(isTelegramStartCommand('/review hello')).toBe(false);
    expect(isTelegramStartCommand('start')).toBe(false);
  });
});
