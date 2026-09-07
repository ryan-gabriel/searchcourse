'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, Column, Modal, InputField, TextareaField } from '@/components/admin';
import type { CategoryWithCounts } from '@/services';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';

interface PaginatedResponse {
    data: CategoryWithCounts[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithCounts[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryWithCounts | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({ name: '', slug: '', description: '', iconName: '', sortOrder: 0 });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
            if (search) params.set('query', search);
            const res = await fetch(`/api/admin/categories?${params}`);
            const data: PaginatedResponse = await res.json();
            setCategories(data.data);
            setPagination((prev) => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, search]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '', iconName: '', sortOrder: 0 });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (category: CategoryWithCounts) => {
        setEditingCategory(category);
        setFormData({ name: category.name, slug: category.slug, description: category.description || '', iconName: category.iconName || '', sortOrder: category.sortOrder });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        try {
            const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
            const method = editingCategory ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, description: formData.description || null, iconName: formData.iconName || null }),
            });
            if (!res.ok) {
                const error = await res.json();
                if (error.errors) setErrors(error.errors);
                else throw new Error(error.message || 'Failed to save');
                return;
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/categories/${deleteId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setDeleteId(null);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const columns: Column<CategoryWithCounts>[] = [
        {
            header: 'Category', accessorKey: 'name',
            cell: (category) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent opacity-20 flex items-center justify-center text-foreground font-bold text-sm">
                        {category.iconName || category.name[0]}
                    </div>
                    <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-foreground opacity-50">{category.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Description', accessorKey: 'description',
            cell: (category) => <p className="text-sm text-foreground opacity-60 truncate max-w-xs">{category.description || '-'}</p>,
        },
        {
            header: 'Order', accessorKey: 'sortOrder',
            cell: (category) => <span className="text-sm">{category.sortOrder}</span>,
        },
        {
            header: 'Courses', accessorKey: '_count',
            cell: (category) => <span className="px-2 py-1 rounded-full text-xs font-medium bg-surface-muted">{category._count.courses}</span>,
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Categories</h1>
                    <p className="text-foreground opacity-60">Manage course categories for filtering</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Category
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 max-w-md">
                    <input type="text" placeholder="Search categories..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
            </div>

            {isLoading ? (
                <AdminTableSkeleton />
            ) : (
                <DataTable columns={columns} data={categories} keyField="id" />
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

            <div className="flex items-center gap-2 text-sm text-foreground opacity-60">
                <span>Actions:</span>
                {categories.map((category) => (
                    <div key={category.id} className="flex gap-1">
                        <button onClick={() => openEditModal(category)} className="p-1.5 rounded hover:bg-surface-muted transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteId(category.id)} className="p-1.5 rounded hover:bg-accent hover:text-accent-ink transition-colors" title="Delete">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} size="md"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}</button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Name" required value={formData.name}
                        onChange={(e) => { const name = e.target.value; setFormData((prev) => ({ ...prev, name, slug: prev.slug || generateSlug(name) })); }}
                        placeholder="e.g., Web Development" error={errors.name} />
                    <InputField label="Slug" required value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., web-development" hint="URL-friendly identifier" error={errors.slug} />
                    <TextareaField label="Description" value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this category" error={errors.description} />
                    <InputField label="Icon Name" value={formData.iconName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, iconName: e.target.value }))}
                        placeholder="e.g., code" hint="Lucide icon name (optional)" error={errors.iconName} />
                    <InputField label="Sort Order" type="number" value={formData.sortOrder}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                        hint="Lower numbers appear first" error={errors.sortOrder} />
                </form>
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" size="sm"
                footer={
                    <>
                        <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleDelete} disabled={isDeleting} className="btn bg-accent text-accent-ink">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                    </>
                }
            >
                <p className="text-foreground opacity-70">Are you sure you want to delete this category? This action cannot be undone. All associated courses will also be deleted.</p>
            </Modal>
        </div>
    );
}
