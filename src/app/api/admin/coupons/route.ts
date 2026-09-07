/**
 * Coupons API Route
 * 
 * GET - List coupons with pagination
 * POST - Create a new coupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCoupons, createCoupon } from '@/services';
import { CouponCreateSchema, CouponSearchSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

export const GET = withAdmin(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const params = CouponSearchSchema.parse({
        courseId: searchParams.get('courseId') || undefined,
        isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
    });

    const result = await searchCoupons(params);
    return NextResponse.json(result);
}, 'Failed to fetch coupons');

export const POST = withAdmin(async (request: NextRequest) => {
    const body = await request.json();
    const data = CouponCreateSchema.parse(body);

    const coupon = await createCoupon(data);
    return NextResponse.json(coupon, { status: 201 });
}, 'Failed to create coupon');
