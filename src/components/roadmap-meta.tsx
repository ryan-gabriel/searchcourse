import type { RoadmapCardData } from '@/components/roadmap-card';
import { LEVEL_LABELS } from '@/lib/format';

export function RoadmapMeta({ roadmap }: { roadmap: RoadmapCardData }) {
  return (
    <span className="tnum flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
      {roadmap.level ? (
        <span className="hidden lg:inline">{LEVEL_LABELS[roadmap.level] ?? roadmap.level}</span>
      ) : null}
      <span>{roadmap.courseCount} courses</span>
      {roadmap.estimatedHours ? <span>~{roadmap.estimatedHours}h</span> : null}
    </span>
  );
}
