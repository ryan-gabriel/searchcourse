import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

const base = 'inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors focus-ring';
const variants = {
  primary: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/90',
  secondary: 'border-border bg-card text-foreground hover:bg-muted',
  ghost: 'border-transparent text-foreground hover:bg-muted',
} as const;
const sizes = {
  md: 'min-h-11 px-4 py-2.5',
  lg: 'min-h-12 px-6 py-3 text-base',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { variant?: Variant; size?: Size; href: string }) {
  return <Link href={href} {...props} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} />;
}

export function buttonClass(variant: Variant = 'primary', className = '', size: Size = 'md'): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}