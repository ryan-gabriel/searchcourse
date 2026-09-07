'use client';

import { useState, useEffect } from 'react';
import { InputField, TextareaField } from '@/components/admin';

interface SiteSettings {
    coursesVerified: string;
    studentSavings: string;
    uptime: string;
    acceptanceRate: string;
    hostingCost: string;
    priceMonitoring: string;
    missionTitle: string;
    missionSubtitle: string;
    missionDescription: string;
}

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<SiteSettings>({
        coursesVerified: '', studentSavings: '', uptime: '', acceptanceRate: '',
        hostingCost: '', priceMonitoring: '', missionTitle: '', missionSubtitle: '', missionDescription: '',
    });

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    coursesVerified: data.coursesVerified || '500+',
                    studentSavings: data.studentSavings || '$45k+',
                    uptime: data.uptime || '99.9%',
                    acceptanceRate: data.acceptanceRate || '4%',
                    hostingCost: data.hostingCost || '$0.00',
                    priceMonitoring: data.priceMonitoring || '24/7',
                    missionTitle: data.missionTitle || 'Signal over Noise',
                    missionSubtitle: data.missionSubtitle || '',
                    missionDescription: data.missionDescription || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to update');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
                        <p className="text-foreground opacity-60">Global configuration and content</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={isSaving} className="btn btn-primary">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid gap-8">
                <div className="bg-surface-elevated p-6 rounded-xl border border-border space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Homepage Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InputField label="Courses Verified" value={formData.coursesVerified}
                            onChange={(e) => setFormData({ ...formData, coursesVerified: e.target.value })} />
                        <InputField label="Student Savings" value={formData.studentSavings}
                            onChange={(e) => setFormData({ ...formData, studentSavings: e.target.value })} />
                        <InputField label="Uptime" value={formData.uptime}
                            onChange={(e) => setFormData({ ...formData, uptime: e.target.value })} />
                        <InputField label="Acceptance Rate" value={formData.acceptanceRate}
                            onChange={(e) => setFormData({ ...formData, acceptanceRate: e.target.value })} />
                        <InputField label="Hosting Cost" value={formData.hostingCost}
                            onChange={(e) => setFormData({ ...formData, hostingCost: e.target.value })} />
                        <InputField label="Price Monitoring" value={formData.priceMonitoring}
                            onChange={(e) => setFormData({ ...formData, priceMonitoring: e.target.value })} />
                    </div>
                </div>

                <div className="bg-surface-elevated p-6 rounded-xl border border-border space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Mission Content</h2>
                    <div className="space-y-4">
                        <InputField label="Title" value={formData.missionTitle}
                            onChange={(e) => setFormData({ ...formData, missionTitle: e.target.value })} />
                        <InputField label="Subtitle" value={formData.missionSubtitle}
                            onChange={(e) => setFormData({ ...formData, missionSubtitle: e.target.value })} />
                        <TextareaField label="Mission Description" value={formData.missionDescription}
                            onChange={(e) => setFormData({ ...formData, missionDescription: e.target.value })} rows={5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
