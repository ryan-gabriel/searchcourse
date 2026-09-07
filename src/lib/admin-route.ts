import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { ZodError } from 'zod';

type RouteHandler = (request: NextRequest, ctx?: { params: Promise<{ id: string }> }) => Promise<NextResponse>;

export function withAdmin(handler: RouteHandler, errorMessage = 'Internal server error'): RouteHandler {
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
