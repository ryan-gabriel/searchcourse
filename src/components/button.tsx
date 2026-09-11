import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

const base = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-ring';
const variants = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
  secondary: 'border border-border bg-card text-foreground hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
} as const;

type Variant = keyof typeof variants;

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  variant = 'primary',
  className = '',
  href,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { variant?: Variant; href: string }) {
  return <Link href={href} {...props} className={`${base} ${variants[variant]} ${className}`} />;
}

export function buttonClass(variant: Variant = 'primary', className = ''): string {
  return `${base} ${variants[variant]} ${className}`;
}