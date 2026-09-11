import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StepsEditor } from '@/components/admin/steps-editor';
import { getRoadmapById, searchCourses } from '@/services';

export const metadata: Metadata = { title: 'Roadmap steps' };

export default async function RoadmapStepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [roadmap, coursesResult] = await Promise.all([
    getRoadmapById(id),
    searchCourses({ query: '', page: 1, limit: 500, sortBy: 'date', sortOrder: 'desc' }),
  ]);

  if (!roadmap) {
    notFound();
  }

  const steps = roadmap.steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    orderIndex: step.orderIndex,
    course: {
      id: step.course.id,
      title: step.course.title,
      slug: step.course.slug,
    },
  }));

  const courses = coursesResult.data
    .map((course) => ({ id: course.id, title: course.title }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <header>
        <Link
          href="/admin/roadmaps"
          className="focus-ring rounded-sm text-sm text-muted-foreground hover:text-foreground"
        >
          Roadmaps
        </Link>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{roadmap.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {roadmap.courseCount} course{roadmap.courseCount === 1 ? '' : 's'}
          </span>
          <span aria-hidden="true">·</span>
          <Link href={`/roadmaps/${roadmap.slug}`} className="focus-ring rounded-sm hover:text-foreground">
            Public view
          </Link>
        </div>
      </header>

      <div className="mt-8">
        <StepsEditor roadmapId={roadmap.id} steps={steps} courses={courses} />
      </div>
    </>
  );
}