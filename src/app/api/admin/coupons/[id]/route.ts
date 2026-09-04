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

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const coupon = await getCouponById(id);

        if (!coupon) {
            return NextResponse.json(
                { message: 'Coupon not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(coupon);
    } catch (error) {
        console.error('Error fetching coupon:', error);
        return NextResponse.json(
            { message: 'Failed to fetch coupon' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = CouponUpdateSchema.parse({ ...body, id });

        const coupon = await updateCoupon(data);
        return NextResponse.json(coupon);
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { message: 'Validation error', errors: error },
                { status: 400 }
            );
        }
        console.error('Error updating coupon:', error);
        return NextResponse.json(
            { message: 'Failed to update coupon' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await deleteCoupon(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json(
            { message: 'Failed to delete coupon' },
            { status: 500 }
        );
    }
}
