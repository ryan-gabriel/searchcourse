/**
 * Roadmap Progress Component
 *
 * Client component managing localStorage-based progress tracking.
 * Creates "completionist" urge as per PRD requirements.
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';
import { RoadmapStep } from './RoadmapStep';
import type { RoadmapStepWithCourse } from '@/services/roadmap.service';

interface RoadmapProgressProps {
    roadmapId: string;
    steps: RoadmapStepWithCourse[];
}

const STORAGE_KEY_PREFIX = 'roadmap_progress_';

export function RoadmapProgress({ roadmapId, steps }: RoadmapProgressProps) {
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load progress from localStorage on mount
    useEffect(() => {
        const storageKey = `${STORAGE_KEY_PREFIX}${roadmapId}`;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setCompletedSteps(new Set(parsed));
                }
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
        setIsLoaded(true);
    }, [roadmapId]);

    // Save progress to localStorage
    useEffect(() => {
        if (!isLoaded) return;

        const storageKey = `${STORAGE_KEY_PREFIX}${roadmapId}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify([...completedSteps]));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }, [completedSteps, roadmapId, isLoaded]);

    const toggleStep = (stepId: string) => {
        setCompletedSteps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(stepId)) {
                newSet.delete(stepId);
            } else {
                newSet.add(stepId);
            }
            return newSet;
        });
    };

    const completedCount = completedSteps.size;
    const totalCount = steps.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isCompleted = completedCount === totalCount && totalCount > 0;

    return (
        <div className="space-y-8">
            {/* Progress Bar */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {isCompleted ? (
                            <Trophy className="w-6 h-6 text-price" />
                        ) : (
                            <CheckCircle2 className="w-6 h-6 text-accent" />
                        )}
                        <div>
                            <h3 className="font-semibold text-foreground">
                                {isCompleted ? 'Roadmap Completed! 🎉' : 'Your Progress'}
                            </h3>
                            <p className="text-sm text-muted">
                                {completedCount} of {totalCount} courses completed
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-accent">
                            {progressPercent}%
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div
                    className="relative h-3 bg-surface-muted rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Roadmap progress ${progressPercent}%`}
                >
                    <div
                        className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Quick tip */}
                <p className="mt-4 text-xs text-muted text-center">
                    💡 Your progress is saved automatically in your browser
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-0">
                {steps.map((step, index) => (
                    <RoadmapStep
                        key={step.id}
                        step={step}
                        stepNumber={index + 1}
                        totalSteps={totalCount}
                        isCompleted={completedSteps.has(step.id)}
                        onToggleComplete={() => toggleStep(step.id)}
                    />
                ))}
            </div>
        </div>
    );
}
