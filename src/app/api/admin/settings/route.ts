/**
 * Site Settings API
 * 
 * GET - Fetch settings
 * PUT - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/services/settings.service';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-guard';

const SettingsSchema = z.object({
    coursesVerified: z.string().max(100).optional(),
    studentSavings: z.string().max(100).optional(),
    uptime: z.string().max(100).optional(),
    acceptanceRate: z.string().max(100).optional(),
    hostingCost: z.string().max(100).optional(),
    priceMonitoring: z.string().max(100).optional(),
    missionTitle: z.string().max(200).optional(),
    missionSubtitle: z.string().max(255).optional(),
    missionDescription: z.string().max(5000).optional(),
});

export async function GET() {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
        const settings = await getSiteSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { message: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    try {
        const body = await request.json();
        const data = SettingsSchema.parse(body);

        const settings = await updateSiteSettings(data);
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { message: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
