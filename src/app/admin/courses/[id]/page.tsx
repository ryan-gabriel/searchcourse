import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseContent } from '@/services';
import { ContentEditor } from '@/components/admin/content-editor';

export const metadata: Metadata = {
  title: 'Edit course',
};

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseContent(id);

  if (!course) {
    notFound();
  }

  return (
    <>
      <Link href="/admin/courses" className="focus-ring text-sm font-medium text-muted-foreground hover:text-foreground">
        Back to courses
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{course.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{course.slug}</p>
      <ContentEditor course={course} />
    </>
  );
}