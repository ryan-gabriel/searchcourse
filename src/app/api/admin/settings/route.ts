/**
 * Site Settings API
 * 
 * GET - Fetch settings
 * PUT - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/services/settings.service';
import { z } from 'zod';
import { withAdmin } from '@/lib/admin-route';

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

export const GET = withAdmin(async () => {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
}, 'Failed to fetch settings');

export const PUT = withAdmin(async (request: NextRequest) => {
    const body = await request.json();
    const data = SettingsSchema.parse(body);

    const settings = await updateSiteSettings(data);
    return NextResponse.json(settings);
}, 'Failed to update settings');
