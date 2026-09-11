'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/button';

export interface StepItem {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  course: {
    id: string;
    title: string;
    slug: string | null;
  };
}

export interface CourseOption {
  id: string;
  title: string;
}

const inputClass =
  'w-full rounded-md border border-border bg-card px-4 py-2 text-sm focus-ring';

const iconButtonClass =
  'focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40';

export function StepsEditor({
  roadmapId,
  steps,
  courses,
}: {
  roadmapId: string;
  steps: StepItem[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function addStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !courseId) return;

    const nextOrderIndex =
      steps.length === 0
        ? 0
        : Math.max(...steps.map((step) => step.orderIndex)) + 1;

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/roadmaps/${roadmapId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          ...(description.trim() ? { description: description.trim() } : {}),
          orderIndex: nextOrderIndex,
          courseId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add step');
      }
      setTitle('');
      setDescription('');
      setCourseId('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add step');
    } finally {
      setBusy(false);
    }
  }

  async function removeStep(stepId: string) {
    if (!window.confirm('Remove this step from the roadmap?')) return;

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/roadmaps/${roadmapId}/steps/${stepId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove step');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove step');
    } finally {
      setBusy(false);
    }
  }

  async function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;

    const next = steps.map((step) => ({ ...step }));
    const moved = next[index]!;
    next[index] = next[target]!;
    next[target] = moved;
    const stepOrder = next.map((step, i) => ({ id: step.id, orderIndex: i }));

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/roadmaps/${roadmapId}/steps/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepOrder }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reorder steps');
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder steps';
      setError(`${message} The order was not changed.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Steps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {steps.length} step{steps.length === 1 ? '' : 's'} in this path
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        {steps.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No steps yet. Add the first course below.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="w-12 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Order
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Step
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Course
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, index) => (
                <tr key={step.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium">{step.orderIndex + 1}</td>
                  <td className="px-4 py-3">{step.title}</td>
                  <td className="px-4 py-3">
                    {step.course.slug ? (
                      <Link href={`/courses/${step.course.slug}`} className="focus-ring rounded-sm hover:underline">
                        {step.course.title}
                      </Link>
                    ) : (
                      step.course.title
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => moveStep(index, -1)}
                        disabled={busy || index === 0}
                        aria-label={`Move step up: ${step.title}`}
                        className={iconButtonClass}
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(index, 1)}
                        disabled={busy || index === steps.length - 1}
                        aria-label={`Move step down: ${step.title}`}
                        className={iconButtonClass}
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        disabled={busy}
                        aria-label={`Remove step: ${step.title}`}
                        className={`${iconButtonClass} hover:border-destructive hover:text-destructive`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mt-12 text-2xl font-semibold tracking-tight">Add a step</h2>
      <p className="mt-1 text-sm text-muted-foreground">Appends to the end of the path.</p>

      <form onSubmit={addStep} className="mt-6 max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="step-title" className="mb-1 block text-sm font-medium">
              Step title
            </label>
            <input
              id="step-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={200}
              placeholder="Start with HTML and CSS"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="step-course" className="mb-1 block text-sm font-medium">
              Course
            </label>
            <select
              id="step-course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="step-description" className="mb-1 block text-sm font-medium">
            Step description
          </label>
          <textarea
            id="step-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Why this course belongs in the path."
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? 'Adding...' : 'Add step'}
        </Button>
      </form>
    </section>
  );
}