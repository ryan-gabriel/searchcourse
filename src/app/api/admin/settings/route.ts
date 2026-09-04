/**
 * Site Settings API
 * 
 * GET - Fetch settings
 * PUT - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/services/settings.service';
import { z } from 'zod';

const SettingsSchema = z.object({
    coursesVerified: z.string().optional(),
    studentSavings: z.string().optional(),
    uptime: z.string().optional(),
    acceptanceRate: z.string().optional(),
    hostingCost: z.string().optional(),
    priceMonitoring: z.string().optional(),
    missionTitle: z.string().optional(),
    missionSubtitle: z.string().optional(),
    missionDescription: z.string().optional(),
});

export async function GET() {
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
