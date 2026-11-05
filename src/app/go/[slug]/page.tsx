import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCourseBySlug } from '@/services';
import { SITE_NAME, siteUrl } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return { title: 'Course not found' };
  }

  return {
    title: course.title,
    openGraph: {
      title: course.title,
      images: course.thumbnailUrl
        ? [{ url: course.thumbnailUrl, alt: course.title }]
        : [{ url: siteUrl('/seo/og-image.jpg'), width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      images: course.thumbnailUrl
        ? [{ url: course.thumbnailUrl, alt: course.title }]
        : [{ url: siteUrl('/seo/twitter-card.jpg'), width: 1200, height: 600, alt: SITE_NAME }],
    },
  };
}

export default async function GoPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    redirect('/courses');
  }

  redirect(`/courses/${course.slug}?src=tg`);
}
