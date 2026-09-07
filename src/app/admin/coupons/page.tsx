'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable, Column, Modal, InputField, SelectField, SwitchField } from '@/components/admin';
import type { CouponWithCourse } from '@/services';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';

interface Course {
    id: string;
    title: string;
    originalPrice: number;
}

interface PaginatedResponse {
    data: CouponWithCourse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

const discountTypeOptions = [
    { value: 'PERCENTAGE', label: 'Percentage' },
    { value: 'FIXED', label: 'Fixed Amount' },
];

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<CouponWithCourse[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isCoursesLoading, setIsCoursesLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterActive, setFilterActive] = useState<string>('');
    const [debouncedFilterActive, setDebouncedFilterActive] = useState<string>('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<CouponWithCourse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        courseId: '', code: '', discountType: 'PERCENTAGE', discountValue: 0,
        finalPrice: 0, expiresAt: '', isActive: true, source: '',
    });

    useEffect(() => {
        const fetchCourses = async () => {
            setIsCoursesLoading(true);
            try {
                const res = await fetch('/api/admin/courses?limit=500');
                const data = await res.json();
                setCourses(data.data?.map((c: { id: string; title: string; originalPrice: number }) => ({
                    id: c.id, title: c.title, originalPrice: c.originalPrice,
                })) || []);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setIsCoursesLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setDebouncedFilterActive(filterActive);
        }, 500);
        return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
    }, [search, filterActive]);

    const fetchCoupons = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
            if (debouncedSearch) params.set('query', debouncedSearch);
            if (debouncedFilterActive !== '') params.set('isActive', debouncedFilterActive);
            const res = await fetch(`/api/admin/coupons?${params}`);
            const data: PaginatedResponse = await res.json();
            setCoupons(data.data);
            setPagination((prev) => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, debouncedSearch, debouncedFilterActive]);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const openCreateModal = () => {
        setEditingCoupon(null);
        setFormData({ courseId: courses[0]?.id || '', code: '', discountType: 'PERCENTAGE', discountValue: 0, finalPrice: 0, expiresAt: '', isActive: true, source: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (coupon: CouponWithCourse) => {
        setEditingCoupon(coupon);
        setFormData({
            courseId: coupon.course.id, code: coupon.code || '', discountType: coupon.discountType,
            discountValue: coupon.discountValue, finalPrice: coupon.finalPrice,
            expiresAt: coupon.expiresAt ? toDatetimeLocal(coupon.expiresAt) : '',
            isActive: coupon.isActive, source: coupon.source || '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const calculateFinalPrice = (originalPrice: number, discountType: string, discountValue: number) => {
        if (discountType === 'PERCENTAGE') return originalPrice * (1 - discountValue / 100);
        return Math.max(0, originalPrice - discountValue);
    };

    const handleDiscountChange = (discountValue: number) => {
        const selectedCourse = courses.find((c) => c.id === formData.courseId);
        if (selectedCourse) {
            const finalPrice = calculateFinalPrice(selectedCourse.originalPrice, formData.discountType, discountValue);
            setFormData((prev) => ({ ...prev, discountValue, finalPrice: Math.round(finalPrice * 100) / 100 }));
        } else {
            setFormData((prev) => ({ ...prev, discountValue }));
        }
    };

    const handleCourseChange = (courseId: string) => {
        const selectedCourse = courses.find((c) => c.id === courseId);
        if (selectedCourse) {
            const finalPrice = calculateFinalPrice(selectedCourse.originalPrice, formData.discountType, formData.discountValue);
            setFormData((prev) => ({ ...prev, courseId, finalPrice: Math.round(finalPrice * 100) / 100 }));
        } else {
            setFormData((prev) => ({ ...prev, courseId }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        try {
            const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
            const method = editingCoupon ? 'PUT' : 'POST';
            const payload = {
                ...formData, code: formData.code || null,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
                source: formData.source || null,
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
            fetchCoupons();
        } catch (error) {
            console.error('Failed to save coupon:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/coupons/${deleteId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setDeleteId(null);
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete coupon:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const toDatetimeLocal = (date: Date | string) => {
        const d = new Date(date);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const columns: Column<CouponWithCourse>[] = [
        {
            header: 'Course', accessorKey: 'course',
            cell: (coupon) => (
                <div className="min-w-0">
                    <p className="font-medium truncate max-w-xs">{coupon.course.title}</p>
                    <p className="text-xs text-foreground opacity-50">Original: ${coupon.course.originalPrice.toFixed(2)}</p>
                </div>
            ),
        },
        {
            header: 'Code', accessorKey: 'code',
            cell: (coupon) => <span className="font-mono text-sm bg-surface-muted px-2 py-1 rounded">{coupon.code || 'Auto-applied'}</span>,
        },
        {
            header: 'Discount', accessorKey: 'discountValue',
            cell: (coupon) => (
                <span className="font-medium">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue.toFixed(2)}`}
                </span>
            ),
        },
        {
            header: 'Final Price', accessorKey: 'finalPrice',
            cell: (coupon) => <span className="font-medium">${coupon.finalPrice.toFixed(2)}</span>,
        },
        {
            header: 'Expires', accessorKey: 'expiresAt',
            cell: (coupon) => (
                <span className={isExpired(coupon.expiresAt as unknown as string) ? 'text-accent' : ''}>
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                </span>
            ),
        },
        {
            header: 'Status', accessorKey: 'isActive',
            cell: (coupon) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.isActive && !isExpired(coupon.expiresAt as unknown as string) ? 'bg-price text-white' : 'bg-surface-muted text-foreground opacity-60'}`}>
                    {!coupon.isActive ? 'Inactive' : isExpired(coupon.expiresAt as unknown as string) ? 'Expired' : 'Active'}
                </span>
            ),
        },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
                    <p className="text-foreground opacity-60">Manage course discounts and coupon codes</p>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Coupon
                </button>
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] max-w-md">
                    <input type="text" placeholder="Search by code or course..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <select value={filterActive}
                    onChange={(e) => { setFilterActive(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
                    className="px-4 py-2.5 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {isLoading ? (
                <AdminTableSkeleton />
            ) : (
                <DataTable
                    columns={columns}
                    data={coupons}
                    keyField="id"
                    renderActions={(coupon) => (
                        <>
                            <button onClick={() => openEditModal(coupon)} className="p-1.5 rounded hover:bg-surface-muted transition-colors" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => setDeleteId(coupon.id)} className="p-1.5 rounded hover:bg-accent hover:text-accent-ink transition-colors" title="Delete">
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} size="md"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}</button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <SelectField label="Course" required
                        options={courses.map((c) => ({ value: c.id, label: `${c.title} ($${c.originalPrice})` }))}
                        value={formData.courseId} onChange={(e) => handleCourseChange(e.target.value)}
                        error={errors.courseId} disabled={isCoursesLoading} hint={isCoursesLoading ? 'Loading courses...' : undefined} />
                    <InputField label="Coupon Code" value={formData.code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="Leave empty for auto-applied discount" hint="Optional - format: SAVE20" />
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Discount Type" options={discountTypeOptions} value={formData.discountType}
                            onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value }))} />
                        <InputField label="Discount Value" type="number" required step="0.01" value={formData.discountValue}
                            onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                            hint={formData.discountType === 'PERCENTAGE' ? 'Percentage off' : 'Amount off'} error={errors.discountValue} />
                    </div>
                    <InputField label="Final Price" type="number" required step="0.01" value={formData.finalPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, finalPrice: parseFloat(e.target.value) || 0 }))}
                        hint="Auto-calculated, but can be overridden" error={errors.finalPrice} />
                    <InputField label="Expires At" type="datetime-local" value={formData.expiresAt}
                        onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))}
                        hint="Leave empty for no expiration" />
                    <InputField label="Source" value={formData.source}
                        onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                        placeholder="e.g., Scraper, Manual, Partner" hint="Where this coupon was found" />
                    <SwitchField label="Active" description="Show this discount on the site" checked={formData.isActive}
                        onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))} />
                </form>
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Coupon" size="sm"
                footer={
                    <>
                        <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleDelete} disabled={isDeleting} className="btn bg-accent text-accent-ink">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                    </>
                }
            >
                <p className="text-foreground opacity-70">Are you sure you want to delete this coupon? This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
