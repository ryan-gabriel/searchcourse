'use client';

import { useState } from 'react';
import { ChevronDown, PlayCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyllabusSection {
    title: string;
    lectures: number;
    duration: string;
    items: string[];
}

interface CourseAccordionProps {
    sections: SyllabusSection[];
}

export function CourseAccordion({ sections }: CourseAccordionProps) {
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

    const toggleSection = (index: number) => {
        const newOpen = new Set(openSections);
        if (newOpen.has(index)) {
            newOpen.delete(index);
        } else {
            newOpen.add(index);
        }
        setOpenSections(newOpen);
    };

    const totalLectures = sections.reduce((sum, s) => sum + s.lectures, 0);
    const totalDuration = sections.reduce((sum, s) => {
        const match = s.duration.match(/(\d+)h?\s*(\d+)?m?/);
        if (match) {
            const hours = parseInt(match[1]) || 0;
            const minutes = parseInt(match[2]) || 0;
            return sum + hours * 60 + minutes;
        }
        return sum;
    }, 0);

    const formatTotalDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div>
            <div className="flex items-center gap-6 text-sm text-foreground/60 mb-4">
                <span>{sections.length} sections</span>
                <span>{totalLectures} lectures</span>
                <span>{formatTotalDuration(totalDuration)} total length</span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {sections.map((section, index) => {
                    const hasItems = section.lectures > 0;

                    if (!hasItems) {
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-surface"
                            >
                                <PlayCircle className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                                <span className="text-foreground/70 text-sm">
                                    {section.title}
                                </span>
                                {section.duration && (
                                    <span className="ml-auto text-sm text-foreground/50">
                                        {section.duration}
                                    </span>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={index}>
                            <button
                                onClick={() => toggleSection(index)}
                                aria-expanded={openSections.has(index)}
                                aria-controls={`section-${index}`}
                                className="w-full flex items-center justify-between p-4 bg-surface-muted hover:bg-border/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <ChevronDown
                                        className={cn(
                                            'w-5 h-5 text-foreground/50 transition-transform',
                                            openSections.has(index) && 'rotate-180'
                                        )}
                                    />
                                    <span className="font-medium text-foreground">
                                        {section.title}
                                    </span>
                                </div>
                                <div className="text-sm text-foreground/50">
                                    {section.lectures} lectures &middot; {section.duration}
                                </div>
                            </button>

                            <div
                                id={`section-${index}`}
                                className={cn(
                                    'overflow-hidden transition-all duration-300',
                                    openSections.has(index) ? 'max-h-96' : 'max-h-0'
                                )}
                            >
                                <ul className="p-4 space-y-3 bg-surface">
                                    {section.items.map((item, itemIndex) => (
                                        <li
                                            key={itemIndex}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            {itemIndex % 2 === 0 ? (
                                                <PlayCircle className="w-4 h-4 text-foreground/40" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-foreground/40" />
                                            )}
                                            <span className="text-foreground/70">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
