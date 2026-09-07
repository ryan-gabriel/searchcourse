import type { Metadata } from 'next';
import Link from 'next/link';
import {
    ArrowRight,
    Target,
    Shield,
    ExternalLink,
    Cpu,
    Database,
    Zap,
} from 'lucide-react';
import { getAboutPageStats, getMissionContent } from '@/services';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
    title: 'About Us - Our Mission & Team',
    description:
        'Learn about our mission to curate the highest quality online courses. Meet the experts behind our rigorous vetting process.',
    openGraph: {
        title: 'About SearchCourse | Our Mission',
        description:
            'Learn about our mission to curate the highest quality online courses.',
    },
};

const VALUES = [
    {
        icon: Target,
        title: 'Precision, Not Volume',
        description:
            'Our algorithms reject 96% of content. We only list courses that offer actionable, modern technical skills.',
    },
    {
        icon: Shield,
        title: 'Unbiased Integrity',
        description:
            'Affiliate links are strictly for site maintenance. Our ranking logic is based on student outcomes, not commissions.',
    },
    {
        icon: Zap,
        title: 'Real-Time Data',
        description:
            'We check prices hourly. If a deal expires, it disappears. What you see is what you get.',
    },
];

export const dynamic = 'force-dynamic';

const SYSTEM_COMPONENTS = [
    {
        title: 'GitHub Scrapers',
        description:
            'Node.js cron jobs that scan premium APIs for new course listings hourly.',
        icon: Cpu,
    },
    {
        title: 'Price Intelligence',
        description:
            'Automated tracking of Udemy/Coursera discounts. We alert when prices drop > 80%.',
        icon: Database,
    },
    {
        title: 'Curriculum Audit',
        description:
            'Scripts analyze syllabi keywords to ensure tech stacks are current (e.g., React 19, Python 3.12).',
        icon: Target,
    },
    {
        title: 'Manual Oversight',
        description:
            'Final review by the founder to ensure "Brand Safety" and affiliate compliance standards.',
        icon: Shield,
    },
];

export default async function AboutPage() {
    const [stats, mission] = await Promise.all([
        getAboutPageStats().catch(() => ({
            coursesVerified: '500+',
            acceptanceRate: '4%',
            priceMonitoring: '24/7',
            hostingCost: '$0.00',
        })),
        getMissionContent().catch(() => ({
            title: 'Signal over Noise',
            subtitle: 'The automated discovery engine for technical excellence.',
            description: 'We filter the internet so you can focus on building.',
        })),
    ]);

    const statsArray = [
        { value: stats.coursesVerified, label: 'Courses Analyzed' },
        { value: stats.acceptanceRate, label: 'Acceptance Rate' },
        { value: stats.priceMonitoring, label: 'Price Monitoring' },
        { value: stats.hostingCost, label: 'Hosting Cost' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <ScrollReveal>
            <section className="py-28 lg:py-36">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-muted border border-border">
                        <span className="text-xs font-bold text-foreground uppercase tracking-widest">
                            SearchCourse
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.05] mb-8">
                        {mission.title}
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed mb-10">
                        {mission.description || mission.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
                        <Link
                            href="/courses"
                            className="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl"
                        >
                            Start Learning
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/#problem"
                            className="btn btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl"
                        >
                            Our Mission
                        </Link>
                    </div>
                </div>
            </section>
            </ScrollReveal>

            <section
                id="problem"
                className="py-28 border-t border-border bg-surface-muted"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-surface rounded-3xl p-8 md:p-12 border border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground">
                                <Zap className="w-4 h-4" />
                            </span>
                            The Platform Problem
                        </h2>
                        <div className="space-y-4 text-foreground/60 leading-relaxed">
                            <p>
                                Massive course platforms prioritize{' '}
                                <strong className="text-foreground">ad revenue</strong> and{' '}
                                <strong className="text-foreground">volume</strong>. They bury
                                the best courses under pages of SEO-optimized, low-quality
                                content.
                            </p>
                            <p>
                                As a solo developer, I built SearchCourse to solve this specific
                                friction point. It utilizes serverless architecture to
                                automatically filter, verify, and curate technical courses based
                                on <strong className="text-foreground">relevance</strong> and{' '}
                                <strong className="text-foreground">discount validity</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-28 bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
                        {statsArray.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="text-4xl font-extrabold text-foreground mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-foreground/50 uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-28 bg-surface-muted border-y border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Core Principles
                        </h2>
                        <p className="text-foreground/60">
                            The non-negotiable standards that define every link on this site.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {VALUES.map((value) => (
                            <div
                                key={value.title}
                                className="bg-surface p-8 rounded-2xl border border-border"
                            >
                                <div className="w-12 h-12 mb-6 rounded-xl bg-surface-muted flex items-center justify-center text-foreground">
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-foreground/60 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                The Discovery Engine
                            </h2>
                            <p className="text-foreground/60">
                                How our automated infrastructure ensures quality.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-center gap-2 text-xs font-mono text-foreground/50 bg-surface-muted px-3 py-1.5 rounded-md border border-border">
                                <span className="w-2 h-2 rounded-full bg-price"></span>
                                System Operational
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {SYSTEM_COMPONENTS.map((item) => (
                            <div
                                key={item.title}
                                className="p-6 rounded-xl border border-border hover:border-foreground/30 transition-all bg-surface"
                            >
                                <div className="mb-4 text-foreground">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-foreground/50 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-28 bg-surface-muted border-t border-border">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-surface rounded-full mb-6 border border-border">
                        <ExternalLink className="w-6 h-6 text-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                        Affiliate Disclosure
                    </h3>
                    <div className="bg-surface p-6 rounded-xl border border-border text-sm text-foreground/60 leading-relaxed">
                        <p className="mb-4">
                            SearchCourse is a participant in the Impact.com and other
                            affiliate advertising programs designed to provide a means for
                            sites to earn advertising fees by advertising and linking to
                            partner websites.
                        </p>
                        <p>
                            <strong className="text-foreground">
                                Transparency Promise:
                            </strong>{' '}
                            We may earn a commission if you purchase through our links. This
                            comes at no extra cost to you. We do not accept payment for
                            positive reviews. Our &quot;Top Picks&quot; are determined by
                            algorithmic quality scores.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-28 bg-accent text-accent-ink">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to cut through the noise?
                    </h2>
                    <p className="text-accent-ink/60 mb-8 text-lg">
                        Join the developers who are learning smarter, not harder.
                    </p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-accent-ink text-accent font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Browse Verified Courses
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
