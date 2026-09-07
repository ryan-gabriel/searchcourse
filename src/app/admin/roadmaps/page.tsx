'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, Column, Modal, InputField, TextareaField, SwitchField } from '@/components/admin';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';

interface Roadmap {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    iconName: string | null;
    estimatedHours: number | null;
    courseCount: number;
    sortOrder: number;
    level: string;
    skillTags: string[];
    hasJobGuarantee: boolean;
    hasCertificate: boolean;
    hasFreeResources: boolean;
    isShortPath: boolean;
    isActive: boolean;
    isFeatured: boolean;
}

interface PaginatedResponse {
    data: Roadmap[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function RoadmapsPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: '', slug: '', description: '', iconName: '', estimatedHours: '',
        isActive: true, isFeatured: false, sortOrder: 0, level: 'ALL_LEVELS',
        hasJobGuarantee: false, hasCertificate: false, hasFreeResources: false, isShortPath: false, skillTags: '',
    });

    const fetchRoadmaps = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
            if (search) params.set('query', search);
            const res = await fetch(`/api/admin/roadmaps?${params}`);
            const data: PaginatedResponse = await res.json();
            setRoadmaps(data.data);
            setPagination((prev) => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Failed to fetch roadmaps:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, search]);

    useEffect(() => { fetchRoadmaps(); }, [fetchRoadmaps]);

    const openCreateModal = () => {
        setEditingRoadmap(null);
        setFormData({
            title: '', slug: '', description: '', iconName: '', estimatedHours: '',
            isActive: true, isFeatured: false, sortOrder: 0, level: 'ALL_LEVELS',
            hasJobGuarantee: false, hasCertificate: false, hasFreeResources: false, isShortPath: false, skillTags: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (roadmap: Roadmap) => {
        setEditingRoadmap(roadmap);
        setFormData({
            title: roadmap.title, slug: roadmap.slug, description: roadmap.description || '',
            iconName: roadmap.iconName || '', estimatedHours: roadmap.estimatedHours?.toString() || '',
            isActive: roadmap.isActive, isFeatured: roadmap.isFeatured, sortOrder: roadmap.sortOrder,
            level: roadmap.level || 'ALL_LEVELS',
            hasJobGuarantee: roadmap.hasJobGuarantee || false, hasCertificate: roadmap.hasCertificate || false,
            hasFreeResources: roadmap.hasFreeResources || false, isShortPath: roadmap.isShortPath || false,
            skillTags: roadmap.skillTags?.join(', ') || '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        try {
            const url = editingRoadmap ? `/api/admin/roadmaps/${editingRoadmap.id}` : '/api/admin/roadmaps';
            const method = editingRoadmap ? 'PUT' : 'POST';
            const payload = {
                ...formData,
                description: formData.description || undefined,
                iconName: formData.iconName || undefined,
                estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
                skillTags: formData.skillTags ? formData.skillTags.split(',').map(s => s.trim()).filter(Boolean) : [],
            };
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const error = await res.json();
                if (error.errors) setErrors(error.errors);
                else throw new Error(error.message || 'Failed to save');
                return;
            }
            setIsModalOpen(false);
            fetchRoadmaps();
        } catch (error) {
            console.error('Failed to save roadmap:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/roadmaps/${deleteId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setDeleteId(null);
            fetchRoadmaps();
        } catch (error) {
            console.error('Failed to delete roadmap:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const columns: Column<Roadmap>[] = [
        {
            header: 'Roadmap', accessorKey: 'title',
            cell: (roadmap) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent opacity-20 flex items-center justify-center text-foreground font-bold">
                        {roadmap.iconName || roadmap.title[0]}
                    </div>
                    <div>
                        <p className="font-medium">{roadmap.title}</p>
                        <p className="text-xs text-foreground opacity-50">{roadmap.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Courses', accessorKey: 'courseCount',
            cell: (roadmap) => <span className="px-2 py-1 rounded-full text-xs font-medium bg-surface-muted">{roadmap.courseCount} courses</span>,
        },
        {
            header: 'Duration', accessorKey: 'estimatedHours',
            cell: (roadmap) => <span className="text-sm">{roadmap.estimatedHours ? `${roadmap.estimatedHours}h` : '-'}</span>,
        },
        {
            header: 'Sort', accessorKey: 'sortOrder',
            cell: (roadmap) => <span className="text-sm text-foreground opacity-60">{roadmap.sortOrder}</span>,
        },
        {
            header: 'Status', accessorKey: 'isActive',
            cell: (roadmap) => (
                <div className="flex gap-1">
                    {roadmap.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-ink opacity-80">Featured</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roadmap.isActive ? 'bg-price text-white' : 'bg-surface-muted text-foreground opacity-60'}`}>
                        {roadmap.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Roadmaps</h1>
                    <p className="text-foreground opacity-60">Manage learning paths and course sequences</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Roadmap
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 max-w-md">
                    <input type="text" placeholder="Search roadmaps..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
            </div>

            {isLoading ? (
                <AdminTableSkeleton />
            ) : (
                <DataTable
                    columns={columns}
                    data={roadmaps}
                    keyField="id"
                    renderActions={(roadmap) => (
                        <>
                            <Link href={`/admin/roadmaps/${roadmap.id}/steps`} className="p-1.5 rounded hover:bg-accent/10 transition-colors" title="Manage Steps">
                                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            </Link>
                            <button onClick={() => openEditModal(roadmap)} className="p-1.5 rounded hover:bg-surface-muted transition-colors" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => setDeleteId(roadmap.id)} className="p-1.5 rounded hover:bg-accent hover:text-accent-ink transition-colors" title="Delete">
                                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </>
                    )}
                />
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground opacity-60">Page {pagination.page} of {pagination.totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page <= 1} className="btn btn-secondary disabled:opacity-50">Previous</button>
                        <button onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="btn btn-secondary disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoadmap ? 'Edit Roadmap' : 'Add Roadmap'} size="md"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Saving...' : editingRoadmap ? 'Update' : 'Create'}</button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Title" required value={formData.title}
                        onChange={(e) => { const title = e.target.value; setFormData((prev) => ({ ...prev, title, slug: prev.slug || generateSlug(title) })); }}
                        placeholder="e.g., Full-Stack Developer Roadmap" error={errors.title} />
                    <InputField label="Slug" required value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., full-stack-developer" hint="URL-friendly identifier" error={errors.slug} />
                    <TextareaField label="Description" value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this learning path..." error={errors.description} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Icon Name" value={formData.iconName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, iconName: e.target.value }))}
                            placeholder="e.g., code" hint="Lucide icon name" />
                        <InputField label="Estimated Hours" type="number" value={formData.estimatedHours}
                            onChange={(e) => setFormData((prev) => ({ ...prev, estimatedHours: e.target.value }))}
                            placeholder="e.g., 100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-foreground">Difficulty Level</label>
                            <select value={formData.level}
                                onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/50">
                                <option value="ALL_LEVELS">All Levels</option>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                        <InputField label="Sort Order" type="number" value={formData.sortOrder}
                            onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                            hint="Lower numbers appear first" />
                    </div>
                    <InputField label="Skill Tags (comma separated)" value={formData.skillTags}
                        onChange={(e) => setFormData((prev) => ({ ...prev, skillTags: e.target.value }))}
                        placeholder="e.g., HTML, CSS, JavaScript" hint="Tags for the colored dots" />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <SwitchField label="Job Guarantee" description="Has guarantee" checked={formData.hasJobGuarantee}
                            onChange={(checked) => setFormData((prev) => ({ ...prev, hasJobGuarantee: checked }))} />
                        <SwitchField label="Certificate" description="Includes cert" checked={formData.hasCertificate}
                            onChange={(checked) => setFormData((prev) => ({ ...prev, hasCertificate: checked }))} />
                        <SwitchField label="Free Resources" description="Has freebies" checked={formData.hasFreeResources}
                            onChange={(checked) => setFormData((prev) => ({ ...prev, hasFreeResources: checked }))} />
                        <SwitchField label="Short Path" description="Quick path" checked={formData.isShortPath}
                            onChange={(checked) => setFormData((prev) => ({ ...prev, isShortPath: checked }))} />
                    </div>
                    <div className="flex gap-6 pt-2 border-t border-border">
                        <SwitchField label="Active" description="Show on site" checked={formData.isActive}
                            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))} />
                        <SwitchField label="Featured" description="Show on homepage" checked={formData.isFeatured}
                            onChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))} />
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Roadmap" size="sm"
                footer={
                    <>
                        <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleDelete} disabled={isDeleting} className="btn bg-accent text-accent-ink">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                    </>
                }
            >
                <p className="text-foreground opacity-70">Are you sure you want to delete this roadmap? All steps will also be removed.</p>
            </Modal>
        </div>
    );
}
