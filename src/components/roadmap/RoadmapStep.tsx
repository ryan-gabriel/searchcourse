/**
 * Roadmap Step Component
 *
 * Individual step in a roadmap with course info and progress checkbox.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Check, ExternalLink, Copy } from 'lucide-react';
import { cn, formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import type { RoadmapStepWithCourse } from '@/services/roadmap.service';

interface RoadmapStepProps {
    step: RoadmapStepWithCourse;
    stepNumber: number;
    totalSteps: number;
    isCompleted: boolean;
    onToggleComplete: () => void;
}

export function RoadmapStep({
    step,
    stepNumber,
    totalSteps,
    isCompleted,
    onToggleComplete,
}: RoadmapStepProps) {
    const [copied, setCopied] = useState(false);

    const { course } = step;
    const hasDiscount = course.activeCoupon !== null;
    const finalPrice = hasDiscount ? course.activeCoupon!.finalPrice : course.originalPrice;
    const discountPercent = hasDiscount
        ? calculateDiscountPercentage(course.originalPrice, finalPrice)
        : 0;

    const affiliateUrl = `/api/out/${course.id}`;

    const handleRevealDeal = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (course.activeCoupon?.code) {
            await navigator.clipboard.writeText(course.activeCoupon.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }

        window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            className={cn(
                'relative flex gap-4 md:gap-6',
                stepNumber < totalSteps && 'pb-8'
            )}
        >
            {/* Step indicator and connector line */}
            <div className="flex flex-col items-center">
                {/* Checkbox/Step Number */}
                <button
                    onClick={onToggleComplete}
                    className={cn(
                        'relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center',
                        'border-2 transition-all duration-300',
                        isCompleted
                            ? 'bg-accent border-accent text-accent-ink'
                            : 'bg-surface border-border text-foreground opacity-50 hover:border-accent hover:text-accent'
                    )}
                    aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {isCompleted ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                        <span className="font-bold text-sm md:text-base">{stepNumber}</span>
                    )}
                </button>

                {/* Connector line */}
                {stepNumber < totalSteps && (
                    <div
                        className={cn(
                            'flex-1 w-0.5 mt-2 rounded-full',
                            isCompleted
                                ? 'bg-accent'
                                : 'bg-border'
                        )}
                    />
                )}
            </div>

            {/* Course Card */}
            <div
                className={cn(
                    'flex-1 bg-surface-elevated rounded-2xl overflow-hidden',
                    'transition-all duration-300',
                    'border border-border',
                    'hover:shadow-md',
                    isCompleted && 'opacity-75'
                )}
            >
                <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    <Link
                        href={affiliateUrl}
                        target="_blank"
                        className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0 overflow-hidden"
                    >
                        {course.thumbnailUrl ? (
                            <Image
                                src={course.thumbnailUrl}
                                alt={course.title}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, 200px"
                            />
                        ) : (
                            <div className="w-full h-full bg-surface-muted flex items-center justify-center">
                                <span className="text-foreground text-3xl font-bold opacity-40">
                                    {course.title.charAt(0)}
                                </span>
                            </div>
                        )}

                        {/* Discount Badge */}
                        {hasDiscount && discountPercent > 0 && (
                            <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-ink">
                                    {discountPercent}% OFF
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-5">
                        {/* Step Title */}
                        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                            Step {stepNumber}: {step.title}
                        </p>

                        {/* Course Title */}
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            <Link
                                href={affiliateUrl}
                                target="_blank"
                                className="hover:text-accent transition-colors"
                            >
                                {course.title}
                            </Link>
                        </h3>

                        {/* Course Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-foreground">
                                {course.platform.name}
                            </span>
                            {course.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-accent text-accent" />
                                    <span>{course.rating.toFixed(1)}</span>
                                </div>
                            )}
                            {course.duration && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{course.duration}</span>
                                </div>
                            )}
                        </div>

                        {/* Step Description */}
                        {step.description && (
                            <p className="text-sm text-foreground opacity-70 mb-4 line-clamp-2">
                                {step.description}
                            </p>
                        )}

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-price">
                                    {finalPrice === 0 ? 'FREE' : formatPrice(finalPrice, 'USD')}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-foreground opacity-40 line-through">
                                        {formatPrice(course.originalPrice, 'USD')}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleRevealDeal}
                                className={cn(
                                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
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
                </div>
            </div>
        </div>
    );
}
