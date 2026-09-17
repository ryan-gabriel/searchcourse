import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { ContextImage } from '@/components/context-image';
import { EmptyState } from '@/components/states';
import { JsonLd } from '@/components/json-ld';
import { getAllCategories } from '@/services';
import { imageForCategory } from '@/lib/category-images';
import { buildBreadcrumbSchema } from '@/lib/seo/schema';
import { siteUrl } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Categories',
  description:
    'Browse verified online course deals by category: development, design, data science, marketing, and more. Every listing is coupon-checked and dated.',
  alternates: { canonical: siteUrl('/categories') },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  const jsonLd = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl() },
    { name: 'Categories', url: siteUrl('/categories') },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />

      <Container className="py-10 sm:py-14">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Browse by category</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Every category lists courses with active, verified coupons. Pick a subject and compare current prices.
          </p>
        </header>

        {categories.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={(i % 3) * 70}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="focus-ring group block overflow-hidden rounded-lg border border-border bg-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(26,23,19,0.28)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <ContextImage
                      src={imageForCategory(category.name)}
                      alt={`${category.name} courses`}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      priority={i < 3}
                      className="transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-3 px-5 py-4">
                    <h2 className="font-display text-lg font-semibold tracking-tight group-hover:underline">
                      {category.name}
                    </h2>
                    <span className="tnum shrink-0 text-sm text-muted-foreground">
                      {category._count.courses} deals
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No categories yet"
            body="Categories appear here once courses are imported and grouped."
          />
        )}
      </Container>
    </>
  );
}
