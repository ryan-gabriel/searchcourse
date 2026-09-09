'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Timer,
    PlayCircle,
    FileText,
    Download,
    Smartphone,
    Trophy,
    ArrowRight,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CourseWithDetails } from '@/services';

interface StickyCourseSidebarProps {
    course: CourseWithDetails;
    finalPrice: number;
    originalPrice: number;
    discountPercent: number;
    affiliateUrl: string;
}

export function StickyCourseSidebar({
    course,
    finalPrice,
    originalPrice,
    discountPercent,
    affiliateUrl,
}: StickyCourseSidebarProps) {
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const hasDiscount = discountPercent > 0;

    useEffect(() => {
        const expiresAt = course.activeCoupon?.expiresAt;
        if (!expiresAt) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(expiresAt).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours >= 24) {
                const days = Math.floor(hours / 24);
                setTimeLeft(`${days} days left`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m`);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 60000);
        return () => clearInterval(timer);
    }, [course.activeCoupon]);

    const courseIncludes = [
        ...(course.duration
            ? [{ icon: PlayCircle, text: `${course.duration} on-demand video` }]
            : []),
        ...(course.lectureCount
            ? [{ icon: FileText, text: `${course.lectureCount} lectures` }]
            : []),
        { icon: Download, text: 'Full Lifetime Access' },
        { icon: Smartphone, text: 'Access on Mobile and TV' },
        { icon: Trophy, text: 'Certificate of Completion' },
    ];

    return (
        <div className="sticky top-24">
            <div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden shadow-lg">
                <div className="p-6 border-b border-border">
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-4xl font-bold text-foreground">
                            {finalPrice === 0
                                ? 'FREE'
                                : formatPrice(finalPrice, course.currency)}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="text-lg text-foreground/40 line-through">
                                    {formatPrice(originalPrice, course.currency)}
                                </span>
                                <span className="px-2 py-1 bg-surface-muted text-price text-sm font-semibold rounded">
                                    {discountPercent}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {hasDiscount && timeLeft && (
                        <>
                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                <Timer className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Offer ends in {timeLeft}
                                </span>
                            </div>
                            <p className="text-xs text-foreground/50 mb-4 leading-relaxed">
                                Only a limited number of redemptions are
                                available, so the deal may revert to full price
                                at any time.
                            </p>
                        </>
                    )}

                    <Link
                        href={affiliateUrl}
                        target="_blank"
                        className="btn btn-primary w-full py-4 rounded-xl gap-2"
                    >
                        Secure Your Spot
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="p-6 border-b border-border">
                    <h3 className="font-semibold text-foreground mb-4">
                        This course includes:
                    </h3>
                    <ul className="space-y-3">
                        {courseIncludes.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-center gap-3 text-sm text-foreground/60"
                            >
                                <item.icon className="w-4 h-4 text-foreground/40" />
                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
