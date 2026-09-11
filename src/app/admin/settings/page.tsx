import type { Metadata } from 'next';
import { SettingsForm } from '@/components/admin/settings-form';
import { getSiteSettings } from '@/services';

export const metadata: Metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  const fields = {
    coursesVerified: settings.coursesVerified,
    studentSavings: settings.studentSavings,
    uptime: settings.uptime,
    acceptanceRate: settings.acceptanceRate,
    hostingCost: settings.hostingCost,
    priceMonitoring: settings.priceMonitoring,
    missionTitle: settings.missionTitle,
    missionSubtitle: settings.missionSubtitle ?? '',
    missionDescription: settings.missionDescription ?? '',
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Site settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These values back the numeric and mission claims on the public home and about pages.
      </p>

      <SettingsForm settings={fields} />
    </>
  );
}