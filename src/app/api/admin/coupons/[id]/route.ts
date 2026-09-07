/**
 * Single Coupon API Route
 * 
 * GET - Get coupon by ID
 * PUT - Update coupon
 * DELETE - Delete coupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCouponById, updateCoupon, deleteCoupon } from '@/services';
import { CouponUpdateSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const GET = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const coupon = await getCouponById(id);

    if (!coupon) {
        return NextResponse.json(
            { message: 'Coupon not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(coupon);
}, 'Failed to fetch coupon');

export const PUT = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    const body = await request.json();
    const data = CouponUpdateSchema.parse({ ...body, id });

    const coupon = await updateCoupon(data);
    return NextResponse.json(coupon);
}, 'Failed to update coupon');

export const DELETE = withAdmin(async (request: NextRequest, ctx?: RouteParams) => {
    const { id } = await ctx!.params;
    await deleteCoupon(id);
    return NextResponse.json({ success: true });
}, 'Failed to delete coupon');
