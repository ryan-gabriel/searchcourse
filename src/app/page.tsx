import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Code2,
  BarChart3,
  Database,
  Layout,
  Globe,
  Shield,
} from 'lucide-react';
import { CourseGrid } from '@/components/course';
import {
  getFeaturedCourses,
  getAllCategories,
  getHomepageStats,
  getFeaturedRoadmaps,
} from '@/services';
import { SearchForm } from '@/components/ui/SearchForm';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const dynamic = 'force-dynamic';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'web-development': Code2,
  'data-science': BarChart3,
  'cloud-devops': Database,
  'ui-ux-design': Layout,
  default: Globe,
};

interface Roadmap {
  id: string;
  slug: string;
  title: string;
  courseCount: number;
  estimatedHours: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { courses: number };
}

export default async function HomePage() {
  const [featuredResult, categories, stats, roadmaps] = await Promise.all([
    getFeaturedCourses(8).catch(() => ({
      data: [],
      pagination: { total: 0, page: 1, limit: 8, totalPages: 0, hasNext: false, hasPrev: false },
    })),
    getAllCategories().catch((): Category[] => []),
    getHomepageStats().catch(() => ({
      coursesVerified: '500+',
      studentSavings: '$45k+',
      uptime: '99.9%',
    })),
    getFeaturedRoadmaps(4).catch(() => ({
      data: [] as Awaited<ReturnType<typeof getFeaturedRoadmaps>>['data'],
    })),
  ]);

  return (
    <>
      {/* Hero */}
      <ScrollReveal>
      <section className="bg-background pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]">
            Master New Skills. <br className="hidden md:block" />
            <span className="text-foreground/50">We Filter the Noise.</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop scrolling through low-quality content. SearchCourse aggregates the best
            technical education from top providers, verifying deals so you save money and time.
          </p>

          <SearchForm className="max-w-2xl mx-auto mb-8" />

          <p className="text-sm text-foreground/40">
            Trending:{' '}
            <Link href="/courses?query=react" className="hover:text-foreground underline">
              React Patterns
            </Link>
            ,{' '}
            <Link href="/courses?query=python" className="hover:text-foreground underline">
              Python for Data
            </Link>
            ,{' '}
            <Link href="/courses?query=aws" className="hover:text-foreground underline">
              AWS Cert
            </Link>
          </p>
        </div>
      </section>
      </ScrollReveal>

      {/* Stats Bar */}
      <ScrollReveal>
      <section className="border-y border-border bg-surface-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center divide-x divide-border">
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{stats.coursesVerified}</p>
              <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                Courses Verified
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{stats.studentSavings}</p>
              <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                Student Savings
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{stats.uptime}</p>
              <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                Uptime
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Categories */}
      <ScrollReveal>
      <section className="py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Explore Categories</h2>
              <p className="text-foreground/50">
                Curated learning paths for modern technologies.
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat: Category) => {
              const IconComponent = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default;
              return (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.slug}`}
                  className="group p-6 rounded-2xl border border-border hover:border-foreground/30 transition-all bg-surface"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-surface-muted text-foreground">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1 group-hover:text-foreground/80 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-foreground/50">
                    {cat._count?.courses ?? 0} Courses
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Career Roadmaps Teaser */}
      <ScrollReveal>
      <section className="py-20 lg:py-24 bg-surface-muted border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-ink text-xs font-bold uppercase tracking-wider mb-6">
                <TrendingUp className="w-3 h-3" />
                New Feature
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Career Roadmaps</h2>
              <p className="text-foreground/60 mb-6 text-lg">
                Don&apos;t just buy random courses. Follow a curated path to mastery. Our
                roadmap engine aggregates related courses and calculates your total bundle
                savings.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-price" />
                  Logical learning sequences
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-price" />
                  Progress tracking (Local Storage)
                </li>
                <li className="flex items-center gap-3 text-foreground/70">
                  <CheckCircle2 className="w-5 h-5 text-price" />
                  Dynamic &quot;Bundle Savings&quot; calculator
                </li>
              </ul>
              <Link
                href="/roadmaps"
                className="btn btn-primary px-6 py-3 rounded-lg"
              >
                View Roadmaps
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {roadmaps.data.slice(0, 2).map((roadmap: Roadmap) => (
                <Link
                  key={roadmap.id}
                  href={`/roadmaps/${roadmap.slug}`}
                  className="bg-surface p-6 rounded-xl border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                      <Globe className="w-5 h-5 text-foreground/60" />
                    </div>
                    <span className="text-xs font-bold text-price bg-surface-muted px-2 py-1 rounded">
                      {roadmap.courseCount} Courses
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{roadmap.title}</h3>
                  <p className="text-sm text-foreground/50">
                    {roadmap.estimatedHours ? `${roadmap.estimatedHours}h` : 'Flexible'}{' '}
                    &middot; {roadmap.courseCount} Modules
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Featured Courses */}
      {featuredResult.data.length > 0 && (
        <ScrollReveal>
        <section className="py-20 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Top Picks of the Month
                </h2>
                <p className="text-foreground/50 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-foreground/40" />
                  Manually verified for quality &amp; discount accuracy.
                </p>
              </div>
              <Link
                href="/courses?isFeatured=true"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors"
              >
                View All Deals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <CourseGrid courses={featuredResult.data} />
          </div>
        </section>
        </ScrollReveal>
      )}

      {/* Bottom CTA */}
      <ScrollReveal>
      <section className="py-20 lg:py-24 bg-accent text-accent-ink">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to upgrade your career?
          </h2>
          <p className="text-accent-ink/60 mb-8 text-lg">
            Join thousands of developers saving time and money on technical education. No
            spam, just high-signal deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-ink text-accent font-semibold rounded-xl transition-opacity hover:opacity-90"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-ink/10 text-accent-ink font-semibold rounded-xl border border-accent-ink/20 hover:bg-accent-ink/20 transition-colors"
            >
              Our Vetting Process
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </>
  );
}
