/**
 * Site Settings API
 * 
 * GET - Fetch settings
 * PUT - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/services/settings.service';
import { SettingsSchema } from '@/validations';
import { withAdmin } from '@/lib/admin-route';

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
