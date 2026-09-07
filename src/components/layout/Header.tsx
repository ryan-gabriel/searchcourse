/**
 * Header Component
 *
 * Navigation with theme toggle and branding.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, Sun, Moon, BookOpen, Map, Info } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/roadmaps', label: 'Roadmaps', icon: Map },
    { href: '/about', label: 'About', icon: Info },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-50 bg-surface border-b border-border">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        {/* Light mode: show dark logo, Dark mode: show light logo */}
                        <Image
                            src="/seo/long-logo-dark.png"
                            alt="SearchCourse"
                            width={180}
                            height={40}
                            className="h-14 w-auto dark:hidden"
                            priority
                        />
                        <Image
                            src="/seo/long-logo-light.png"
                            alt="SearchCourse"
                            width={180}
                            height={40}
                            className="h-14 w-auto hidden dark:block"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    'text-foreground opacity-70 hover:text-accent hover:bg-surface-muted'
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg text-foreground opacity-70 hover:text-accent hover:bg-surface-muted transition-colors"
                            aria-label="Toggle theme"
                        >
                            {resolvedTheme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-lg text-foreground opacity-70 hover:text-accent hover:bg-surface-muted transition-colors"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-navigation"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div id="mobile-navigation" className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                        'text-foreground opacity-70 hover:text-accent hover:bg-surface-muted'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
