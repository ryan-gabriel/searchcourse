/**
 * Coupons API Route
 * 
 * GET - List coupons with pagination
 * POST - Create a new coupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCoupons, createCoupon } from '@/services';
import { CouponCreateSchema } from '@/validations';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params = {
            query: searchParams.get('query') || undefined,
            courseId: searchParams.get('courseId') || undefined,
            isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
        };

        const result = await searchCoupons(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json(
            { message: 'Failed to fetch coupons' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = CouponCreateSchema.parse(body);

        const coupon = await createCoupon(data);
        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error creating coupon:', error);
        return NextResponse.json(
            { message: 'Failed to create coupon' },
            { status: 500 }
        );
    }
}
