/**
 * Footer Component
 *
 * Site footer with affiliate disclosure and legal links.
 */

import Link from 'next/link';
import { BookOpen, Heart, ExternalLink } from 'lucide-react';

const footerLinks = {
    resources: [
        { href: '/courses', label: 'All Courses' },
        { href: '/roadmaps', label: 'Learning Paths' },
        { href: '/about', label: 'About Us' },
    ],
    legal: [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
    ],
};

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface-muted border-t border-border">
            {/* Affiliate Disclosure */}
            <div className="border-b border-border bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <p className="text-xs text-foreground opacity-60 text-center">
                        <strong>Affiliate Disclosure:</strong> Some links on this site are affiliate links.
                        We may earn a commission at no extra cost to you when you make a purchase through our links.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-accent-ink" />
                            </div>
                            <span className="text-xl font-bold text-foreground">
                                SearchCourse
                            </span>
                        </Link>
                        <p className="text-foreground opacity-70 text-sm max-w-md mb-4">
                            Your trusted destination for discovering high-quality online courses
                            with the best deals. We curate and verify courses from top platforms
                            to help you learn smarter, not harder.
                        </p>
                        <p className="text-foreground opacity-50 text-sm">
                            Built with <Heart className="w-4 h-4 inline text-accent" /> for lifelong learners.
                        </p>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-foreground opacity-70 hover:text-accent text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-foreground opacity-70 hover:text-accent text-sm transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-foreground opacity-50 text-sm">
                        © {currentYear} SearchCourse. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-foreground opacity-50">
                        <span>Courses from:</span>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.udemy.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-accent transition-colors inline-flex items-center gap-1"
                            >
                                Udemy <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                                href="https://www.coursera.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-accent transition-colors inline-flex items-center gap-1"
                            >
                                Coursera <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
