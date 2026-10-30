import { describe, expect, it } from 'vitest';
import { FeedbackCreateSchema } from '@/validations/feedback.schema';

describe('FeedbackCreateSchema', () => {
  it('defaults to a suggestion and trims the message', () => {
    const parsed = FeedbackCreateSchema.parse({ message: '  Please add more deals  ' });
    expect(parsed.type).toBe('SUGGESTION');
    expect(parsed.message).toBe('Please add more deals');
  });

  it('accepts a review with optional contact details', () => {
    const parsed = FeedbackCreateSchema.parse({
      type: 'REVIEW',
      message: 'Great site',
      name: 'Ryan',
      email: 'ryan@example.com',
    });
    expect(parsed.type).toBe('REVIEW');
    expect(parsed.email).toBe('ryan@example.com');
  });

  it('rejects messages outside the length bounds', () => {
    expect(FeedbackCreateSchema.safeParse({ message: 'hi' }).success).toBe(false);
    expect(FeedbackCreateSchema.safeParse({ message: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(
      FeedbackCreateSchema.safeParse({ message: 'Hello there', email: 'not-an-email' }).success
    ).toBe(false);
  });

  it('allows empty optional contact fields', () => {
    const parsed = FeedbackCreateSchema.parse({
      message: 'Hello there',
      name: null,
      email: null,
    });
    expect(parsed.name).toBeNull();
    expect(parsed.email).toBeNull();
  });
});
