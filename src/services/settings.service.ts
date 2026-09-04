/**
 * Site Settings Service
 * 
 * Manages global site settings (singleton).
 */

import prisma from '@/lib/prisma';

export const SETTINGS_ID = 'site-settings';

export interface SiteSettingsUpdateInput {
    coursesVerified?: string;
    studentSavings?: string;
    uptime?: string;
    acceptanceRate?: string;
    hostingCost?: string;
    priceMonitoring?: string;
    missionTitle?: string;
    missionSubtitle?: string;
    missionDescription?: string;
}

/**
 * Get site settings (creates default if missing)
 */
export async function getSiteSettings() {
    // @ts-ignore - Property exists in generated client, editor sync issue
    return prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: {},
        create: {
            id: SETTINGS_ID,
        },
    });
}

/**
 * Update site settings
 */
export async function updateSiteSettings(data: SiteSettingsUpdateInput) {
    // @ts-ignore - Property exists in generated client, editor sync issue
    return prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: data,
        create: {
            id: SETTINGS_ID,
            ...data,
        },
    });
}

/**
 * Get stats for About page
 */
export async function getAboutPageStats() {
    const settings = await getSiteSettings();
    return {
        coursesVerified: settings.coursesVerified,
        studentSavings: settings.studentSavings,
        uptime: settings.uptime,
        acceptanceRate: settings.acceptanceRate,
        hostingCost: settings.hostingCost,
        priceMonitoring: settings.priceMonitoring,
    };
}

/**
 * Get mission content for About page
 */
export async function getMissionContent() {
    const settings = await getSiteSettings();
    return {
        title: settings.missionTitle,
        subtitle: settings.missionSubtitle || '',
        description: settings.missionDescription || '',
    };
}

/**
 * Get stats for Homepage
 */
export async function getHomepageStats() {
    const settings = await getSiteSettings();
    return {
        coursesVerified: settings.coursesVerified,
        studentSavings: settings.studentSavings,
        uptime: settings.uptime,
    };
}
