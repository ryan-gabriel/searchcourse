/**
 * Server-side admin login.
 *
 * Supabase sign-in runs through this route so it can be rate limited
 * per email+IP before the password verification attempt, instead of calling
 * the Supabase client directly from the browser. Session cookies are written
 * by the SSR server client and returned on the response.
 *
 * POST /api/auth/login
 * { "email": "...", "password": "..." }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { LoginSchema } from '@/validations';
import { rateLimiters, getRateLimitHeaders, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Any JSON parse failure is a malformed request, not an auth attempt.
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const ip = getClientIp(request.headers);
  const rateLimitResult = rateLimiters.login(`${email}|${ip}`);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Try again later.' },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}