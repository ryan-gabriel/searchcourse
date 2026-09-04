'use client';

/**
 * Modal Component
 *
 * Reusable modal with animations and accessibility.
 */

import { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    footer?: React.ReactNode;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                p-4
                bg-black/50
                animate-fadeIn
            "
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`
                    w-full ${sizeClasses[size]}
                    bg-surface
                    rounded-2xl
                    border border-border
                    animate-fadeIn
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2
                        id="modal-title"
                        className="text-lg font-semibold text-foreground"
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="
                            p-2 rounded-lg
                            text-foreground opacity-40 hover:text-accent
                            hover:bg-surface-muted
                            transition-colors
                        "
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Confirm Dialog variant
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    const variantStyles = {
        danger: 'bg-accent',
        warning: 'bg-accent',
        info: 'bg-accent',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="btn btn-secondary"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`btn text-accent-ink ${variantStyles[variant]}`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </>
            }
        >
            <p className="text-foreground opacity-70">{message}</p>
        </Modal>
    );
}
