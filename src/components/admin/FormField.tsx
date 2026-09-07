'use client';

/**
 * Form Field Components
 *
 * Reusable form inputs with consistent styling.
 */

import { forwardRef } from 'react';

interface BaseFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
}

interface InputFieldProps extends BaseFieldProps, React.InputHTMLAttributes<HTMLInputElement> { }

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, required, hint, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-accent ml-1">*</span>}
                </label>
                <input
                    ref={ref}
                    className={`
                        w-full px-4 py-2.5 rounded-xl
                        bg-surface
                        border ${error ? 'border-accent' : 'border-border'}
                        text-foreground
                        placeholder:text-foreground/40
                        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                        transition-colors
                        ${className}
                    `}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-foreground opacity-50">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-accent">{error}</p>
                )}
            </div>
        );
    }
);
InputField.displayName = 'InputField';

interface TextareaFieldProps extends BaseFieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ label, error, required, hint, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-accent ml-1">*</span>}
                </label>
                <textarea
                    ref={ref}
                    className={`
                        w-full px-4 py-2.5 rounded-xl
                        bg-surface
                        border ${error ? 'border-accent' : 'border-border'}
                        text-foreground
                        placeholder:text-foreground/40
                        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                        transition-colors
                        resize-y min-h-[100px]
                        ${className}
                    `}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-foreground opacity-50">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-accent">{error}</p>
                )}
            </div>
        );
    }
);
TextareaField.displayName = 'TextareaField';

interface SelectFieldProps extends BaseFieldProps, React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
    ({ label, error, required, hint, options, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-accent ml-1">*</span>}
                </label>
                <select
                    ref={ref}
                    className={`
                        w-full px-4 py-2.5 rounded-xl
                        bg-surface
                        border ${error ? 'border-accent' : 'border-border'}
                        text-foreground
                        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                        transition-colors
                        ${className}
                    `}
                    {...props}
                >
                    <option value="">Select...</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {hint && !error && (
                    <p className="text-xs text-foreground opacity-50">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-accent">{error}</p>
                )}
            </div>
        );
    }
);
SelectField.displayName = 'SelectField';

interface SwitchFieldProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
}

export function SwitchField({ label, checked, onChange, description }: SwitchFieldProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                {description && (
                    <p className="text-xs text-foreground opacity-50">{description}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${checked ? 'bg-accent' : 'bg-border'}
                `}
            >
                <span
                    className={`
                        absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface-elevated border border-border
                        transition-transform
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}
