'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface LearningOutcome {
    id?: string;
    text: string;
    sortOrder: number;
}

interface SyllabusItem {
    id?: string;
    title: string;
    sortOrder: number;
}

interface SyllabusSection {
    id?: string;
    title: string;
    duration?: string;
    sortOrder: number;
    items: SyllabusItem[];
}

interface CourseDetails {
    id: string;
    title: string;
    slug: string;
    learningOutcomes: LearningOutcome[];
    syllabusSections: SyllabusSection[];
}

export default function CourseContentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
    const [sections, setSections] = useState<SyllabusSection[]>([]);
    const [isSavingOutcomes, setIsSavingOutcomes] = useState(false);
    const [isSavingSyllabus, setIsSavingSyllabus] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/admin/courses/${id}`);
            if (!res.ok) throw new Error('Failed to fetch course');
            const data = await res.json();
            setCourse(data);
            setOutcomes(data.learningOutcomes || []);
            setSections(data.syllabusSections || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const addOutcome = () => {
        setOutcomes([...outcomes, { text: '', sortOrder: outcomes.length }]);
    };

    const updateOutcome = (index: number, text: string) => {
        const newOutcomes = [...outcomes];
        newOutcomes[index].text = text;
        setOutcomes(newOutcomes);
    };

    const removeOutcome = (index: number) => {
        setOutcomes(outcomes.filter((_, i) => i !== index));
    };

    const saveOutcomes = async () => {
        setIsSavingOutcomes(true);
        try {
            await fetch(`/api/admin/courses/${id}/outcomes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outcomes: outcomes.map((o, i) => ({ text: o.text, sortOrder: i })) }),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingOutcomes(false);
        }
    };

    type SyllabusSectionValue = string | number | SyllabusItem[] | undefined;
    const updateSection = (index: number, field: keyof SyllabusSection, value: SyllabusSectionValue) => {
        const newSections = [...sections];
        if (field === 'items') {
            newSections[index].items = value as SyllabusItem[];
        } else if (field === 'sortOrder') {
            newSections[index].sortOrder = value as number;
        } else if (field === 'title') {
            newSections[index].title = value as string;
        } else if (field === 'duration') {
            newSections[index].duration = value as string | undefined;
        }
        setSections(newSections);
    };

    const addSection = () => {
        setSections([...sections, { title: 'New Section', duration: '', sortOrder: sections.length, items: [] }]);
    };

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const addItem = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].items.push({ title: '', sortOrder: newSections[sectionIndex].items.length });
        setSections(newSections);
    };

    const updateItem = (sectionIndex: number, itemIndex: number, title: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].items[itemIndex].title = title;
        setSections(newSections);
    };

    const removeItem = (sectionIndex: number, itemIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
        setSections(newSections);
    };

    const saveSyllabus = async () => {
        setIsSavingSyllabus(true);
        try {
            await fetch(`/api/admin/courses/${id}/syllabus`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sections: sections.map((s, i) => ({
                        title: s.title,
                        duration: s.duration,
                        sortOrder: i,
                        items: s.items.map((item, j) => ({ title: item.title, sortOrder: j })),
                    })),
                }),
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingSyllabus(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-foreground opacity-50">Loading editor...</div>;
    if (!course) return <div className="p-8 text-center text-accent">Course not found</div>;

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/courses" className="p-2 -ml-2 rounded-lg hover:bg-surface-muted transition-colors">
                        <svg className="w-5 h-5 text-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Content Editor</h1>
                        <p className="text-foreground opacity-60">{course.title}</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">What you&apos;ll learn</h2>
                        <button onClick={saveOutcomes} disabled={isSavingOutcomes} className="btn btn-primary">
                            {isSavingOutcomes ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                    <div className="space-y-3 bg-surface p-4 rounded-xl border border-border">
                        {outcomes.map((outcome, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="mt-3 text-foreground opacity-30 cursor-move">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                                </div>
                                <div className="flex-1">
                                    <input type="text" value={outcome.text} onChange={(e) => updateOutcome(index, e.target.value)}
                                        placeholder="Enter learning outcome..."
                                        className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                                </div>
                                <button onClick={() => removeOutcome(index)} className="mt-2 text-foreground opacity-30 hover:text-accent transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        <button onClick={addOutcome}
                            className="flex items-center justify-center w-full gap-2 py-3 border-2 border-dashed border-border rounded-lg text-foreground opacity-50 hover:border-accent hover:text-accent transition-colors">
                            + Add Outcome
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Syllabus</h2>
                        <button onClick={saveSyllabus} disabled={isSavingSyllabus} className="btn btn-primary">
                            {isSavingSyllabus ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                    <div className="space-y-6">
                        {sections.map((section, sIndex) => (
                            <div key={sIndex} className="bg-surface p-4 rounded-xl border border-border space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="mt-3 text-foreground opacity-30 cursor-move">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                                    </div>
                                    <div className="flex-1 grid gap-2">
                                        <input type="text" value={section.title} onChange={(e) => updateSection(sIndex, 'title', e.target.value)}
                                            placeholder="Section Title"
                                            className="w-full px-3 py-2 font-medium rounded-lg bg-surface-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-foreground opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <input type="text" value={section.duration || ''} onChange={(e) => updateSection(sIndex, 'duration', e.target.value)}
                                                placeholder="Duration (e.g. 2h 10m)"
                                                className="w-32 px-2 py-1 text-sm rounded-lg bg-surface-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                                        </div>
                                    </div>
                                    <button onClick={() => removeSection(sIndex)} className="mt-2 text-foreground opacity-30 hover:text-accent transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                <div className="pl-8 space-y-2">
                                    {section.items.map((item, iIndex) => (
                                        <div key={iIndex} className="flex gap-2 items-center">
                                            <div className="text-foreground opacity-20">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                                            </div>
                                            <input type="text" value={item.title} onChange={(e) => updateItem(sIndex, iIndex, e.target.value)}
                                                placeholder="Lecture title..."
                                                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-surface-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                                            <button onClick={() => removeItem(sIndex, iIndex)} className="text-foreground opacity-20 hover:text-accent transition-colors">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addItem(sIndex)}
                                        className="flex items-center gap-2 text-xs font-medium text-accent hover:opacity-80 px-2 py-1 rounded hover:bg-accent/10 transition-colors">
                                        + Add Lecture
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addSection}
                            className="flex items-center justify-center w-full gap-2 py-4 border-2 border-dashed border-border rounded-xl text-foreground opacity-50 hover:border-accent hover:text-accent transition-colors">
                            + Add Syllabus Section
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
