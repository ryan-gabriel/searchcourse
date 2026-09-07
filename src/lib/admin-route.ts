import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { ZodError } from 'zod';

type RouteHandler<T extends Record<string, string> = Record<string, never>> = (request: NextRequest, ctx?: { params: Promise<T> }) => Promise<NextResponse>;

export function withAdmin<T extends Record<string, string> = Record<string, never>>(handler: RouteHandler<T>, errorMessage = 'Internal server error'): RouteHandler<T> {
  return async (request, ctx) => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
      return await handler(request, ctx);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { message: 'Validation error', errors: error.issues },
          { status: 400 }
        );
      }
      console.error(`Error ${errorMessage}:`, error);
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
  };
}
