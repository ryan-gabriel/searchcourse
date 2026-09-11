import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LEVEL_LABELS } from '@/lib/format';

export interface RoadmapCardData {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  iconName?: string | null;
  estimatedHours?: number | null;
  courseCount: number;
  level?: string;
  skillTags?: string[];
  hasJobGuarantee?: boolean;
  hasCertificate?: boolean;
  hasFreeResources?: boolean;
  isShortPath?: boolean;
  category?: { id: string; name: string; slug: string } | null;
}

export function RoadmapCard({ roadmap }: { roadmap: RoadmapCardData }) {
  const tags = roadmap.skillTags?.length ? roadmap.skillTags.slice(0, 3) : [];

  return (
    <article className="group relative flex flex-col rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md focus-within:shadow-md">
      <Link href={`/roadmaps/${roadmap.slug}`} className="focus-ring" aria-label={roadmap.title}>
        <div className="flex flex-wrap items-center gap-2">
          {roadmap.level ? (
            <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {LEVEL_LABELS[roadmap.level] ?? roadmap.level}
            </span>
          ) : null}
          {roadmap.hasJobGuarantee ? (
            <span className="rounded-sm px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#004733', color: '#ffffff' }}>Job guarantee</span>
          ) : null}
          {roadmap.hasFreeResources ? (
            <span className="rounded-sm px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#004733', color: '#ffffff' }}>Free resources</span>
          ) : null}
          {roadmap.isShortPath ? (
            <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Short path</span>
          ) : null}
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug group-hover:underline">
          {roadmap.title}
        </h3>
        {roadmap.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{roadmap.subtitle}</p>
        ) : null}
      </Link>

      {roadmap.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{roadmap.description}</p>
      ) : null}

      {tags.length ? (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skill tags">
          {tags.map((tag) => (
            <li key={tag} className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">
          {roadmap.courseCount} courses
          {roadmap.estimatedHours ? ` · ~${roadmap.estimatedHours}h` : ''}
        </span>
        <Link
          href={`/roadmaps/${roadmap.slug}`}
          className="focus-ring inline-flex items-center gap-1 rounded-sm font-medium text-foreground hover:underline"
        >
          View path
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}