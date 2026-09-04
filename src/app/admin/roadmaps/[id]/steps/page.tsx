'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Modal, SelectField, InputField, TextareaField } from '@/components/admin';

interface RoadmapStep {
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl: string | null;
        originalPrice: number;
        platform: { name: string };
    };
}

interface Roadmap {
    id: string;
    title: string;
    slug: string;
}

interface Course {
    id: string;
    title: string;
    originalPrice: number;
}

export default function RoadmapStepsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const roadmapId = resolvedParams.id;

    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [steps, setSteps] = useState<RoadmapStep[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ courseId: '', title: '', description: '' });

    const [deleteStep, setDeleteStep] = useState<RoadmapStep | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [roadmapRes, coursesRes] = await Promise.all([
                fetch(`/api/admin/roadmaps/${roadmapId}`),
                fetch('/api/admin/courses?limit=500'),
            ]);
            const roadmapData = await roadmapRes.json();
            const coursesData = await coursesRes.json();
            setRoadmap(roadmapData);
            setSteps(roadmapData.steps || []);
            setCourses(coursesData.data?.map((c: { id: string; title: string; originalPrice: number }) => ({
                id: c.id, title: c.title, originalPrice: c.originalPrice,
            })) || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [roadmapId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/roadmaps/${roadmapId}/steps`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData, roadmapId, orderIndex: steps.length,
                    description: formData.description || undefined,
                }),
            });
            if (!res.ok) throw new Error('Failed to add step');
            setIsAddModalOpen(false);
            setFormData({ courseId: '', title: '', description: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to add step:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStep = async () => {
        if (!deleteStep) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/roadmaps/${roadmapId}/steps/${deleteStep.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete step');
            setDeleteStep(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete step:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const moveStep = async (stepId: string, direction: 'up' | 'down') => {
        const currentIndex = steps.findIndex((s) => s.id === stepId);
        if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === steps.length - 1)) return;
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const newSteps = [...steps];
        const [removed] = newSteps.splice(currentIndex, 1);
        newSteps.splice(newIndex, 0, removed);
        const stepOrder = newSteps.map((s, i) => ({ id: s.id, orderIndex: i }));
        try {
            await fetch(`/api/admin/roadmaps/${roadmapId}/steps/reorder`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stepOrder }),
            });
            setSteps(newSteps.map((s, i) => ({ ...s, orderIndex: i })));
        } catch (error) {
            console.error('Failed to reorder steps:', error);
        }
    };

    const handleCourseChange = (courseId: string) => {
        const course = courses.find((c) => c.id === courseId);
        setFormData((prev) => ({ ...prev, courseId, title: prev.title || course?.title || '' }));
    };

    const availableCourses = courses.filter((c) => !steps.some((s) => s.course.id === c.id));

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-surface-muted rounded w-1/3" />
                    <div className="h-4 bg-surface-muted rounded w-1/2" />
                    <div className="space-y-3 mt-6">
                        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-muted rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-foreground opacity-50 mb-1">
                        <Link href="/admin/roadmaps" className="hover:text-accent">Roadmaps</Link>
                        <span>/</span>
                        <span>{roadmap?.title}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Manage Steps</h1>
                    <p className="text-foreground opacity-60">Add and reorder courses in this roadmap</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} disabled={availableCourses.length === 0} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Course
                </button>
            </div>

            {steps.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                    <p className="text-foreground opacity-50 mb-4">No courses in this roadmap yet</p>
                    <button onClick={() => setIsAddModalOpen(true)} disabled={availableCourses.length === 0} className="btn btn-primary">Add First Course</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {steps.sort((a, b) => a.orderIndex - b.orderIndex).map((step, index) => (
                        <div key={step.id} className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
                            <div className="flex flex-col gap-1">
                                <button onClick={() => moveStep(step.id, 'up')} disabled={index === 0}
                                    className="p-1 rounded hover:bg-surface-muted disabled:opacity-30">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button onClick={() => moveStep(step.id, 'down')} disabled={index === steps.length - 1}
                                    className="p-1 rounded hover:bg-surface-muted disabled:opacity-30">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-accent opacity-20 flex items-center justify-center text-foreground font-bold text-sm">{index + 1}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{step.title}</p>
                                <p className="text-sm text-foreground opacity-50 truncate">{step.course.title} &middot; {step.course.platform.name}</p>
                            </div>
                            <div className="text-sm text-foreground opacity-60">${Number(step.course.originalPrice).toFixed(2)}</div>
                            <button onClick={() => setDeleteStep(step)} className="p-2 rounded-lg hover:bg-accent/10 transition-colors" title="Remove from roadmap">
                                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Course to Roadmap" size="md"
                footer={
                    <>
                        <button onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleAddStep} disabled={isSubmitting || !formData.courseId || !formData.title} className="btn btn-primary">
                            {isSubmitting ? 'Adding...' : 'Add to Roadmap'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleAddStep} className="space-y-4">
                    <SelectField label="Course" required
                        options={availableCourses.map((c) => ({ value: c.id, label: `${c.title} ($${c.originalPrice})` }))}
                        value={formData.courseId} onChange={(e) => handleCourseChange(e.target.value)} />
                    <InputField label="Step Title" required value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Title for this step (defaults to course title)" hint="Can be different from the course title" />
                    <TextareaField label="Description" value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Why this course is in the roadmap..." />
                </form>
            </Modal>

            <Modal isOpen={!!deleteStep} onClose={() => setDeleteStep(null)} title="Remove from Roadmap" size="sm"
                footer={
                    <>
                        <button onClick={() => setDeleteStep(null)} disabled={isDeleting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleDeleteStep} disabled={isDeleting} className="btn bg-accent text-accent-ink">{isDeleting ? 'Removing...' : 'Remove'}</button>
                    </>
                }
            >
                <p className="text-foreground opacity-70">
                    Are you sure you want to remove &quot;{deleteStep?.title}&quot; from this roadmap? The course itself will not be deleted.
                </p>
            </Modal>
        </div>
    );
}
