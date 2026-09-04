/**
 * Course Card Component
 *
 * High-conversion course card with pricing, ratings, and CTA.
 * All clickable elements point to affiliate redirect API.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Users, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { cn, formatPrice, calculateDiscountPercentage, formatCompactNumber } from '@/lib/utils';
import type { CourseWithDetails } from '@/services';

interface CourseCardProps {
    course: CourseWithDetails;
}

export function CourseCard({ course }: CourseCardProps) {
    const [copied, setCopied] = useState(false);

    const hasDiscount = course.activeCoupon !== null;
    const finalPrice = hasDiscount
        ? course.activeCoupon!.finalPrice
        : course.originalPrice;
    const discountPercent = hasDiscount
        ? calculateDiscountPercentage(course.originalPrice, finalPrice)
        : 0;

    const affiliateUrl = `/api/out/${course.id}`;

    const handleRevealDeal = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Copy coupon code if available
        if (course.activeCoupon?.code) {
            await navigator.clipboard.writeText(course.activeCoupon.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }

        // Open affiliate link in new tab
        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <article className="group relative bg-surface rounded-2xl overflow-hidden transition-all duration-300 border border-border hover:border-accent/40">
            {/* Discount Badge */}
            {hasDiscount && discountPercent > 0 && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-ink">
                        {discountPercent}% OFF
                    </span>
                </div>
            )}

            {/* Thumbnail */}
            <Link href={affiliateUrl} target="_blank" className="block relative h-44 overflow-hidden">
                {course.thumbnailUrl ? (
                    <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full bg-surface-muted flex items-center justify-center">
                        <span className="text-foreground text-4xl font-bold opacity-40">
                            {course.title.charAt(0)}
                        </span>
                    </div>
                )}
            </Link>

            <div className="p-5">
                {/* Platform Badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-foreground">
                        {course.platform.name}
                    </span>
                    {course.category && (
                        <span className="text-xs text-foreground opacity-40">
                            {course.category.name}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[3rem]">
                    <Link
                        href={affiliateUrl}
                        target="_blank"
                        className="hover:text-accent transition-colors"
                    >
                        {course.title}
                    </Link>
                </h3>

                {/* Instructor */}
                {course.instructorName && (
                    <p className="text-sm text-foreground opacity-50 mb-3 truncate">
                        by {course.instructorName}
                    </p>
                )}

                {/* Rating and Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                    {course.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            <span className="font-medium text-foreground">
                                {course.rating.toFixed(1)}
                            </span>
                            <span className="text-foreground opacity-40">
                                ({formatCompactNumber(course.reviewCount)})
                            </span>
                        </div>
                    )}
                    {course.studentCount > 0 && (
                        <div className="flex items-center gap-1 text-foreground opacity-50">
                            <Users className="w-4 h-4" />
                            <span>{formatCompactNumber(course.studentCount)}</span>
                        </div>
                    )}
                    {course.duration && (
                        <div className="flex items-center gap-1 text-foreground opacity-50">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                        </div>
                    )}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-price">
                            {finalPrice === 0 ? 'FREE' : formatPrice(finalPrice, course.currency)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-foreground opacity-40 line-through">
                                {formatPrice(course.originalPrice, course.currency)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleRevealDeal}
                        className={cn(
                            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                            'bg-accent text-accent-ink hover:opacity-85',
                            'active:scale-95'
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                {course.activeCoupon?.code ? (
                                    <Copy className="w-4 h-4" />
                                ) : (
                                    <ExternalLink className="w-4 h-4" />
                                )}
                                Get Deal
                            </>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}
