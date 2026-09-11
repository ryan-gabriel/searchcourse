'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buttonClass } from '@/components/button';

export type CourseContentData = {
  id: string;
  slug: string;
  title: string;
  learningOutcomes: { id: string; text: string; sortOrder: number }[];
  syllabusSections: {
    id: string;
    title: string;
    duration: string | null;
    sortOrder: number;
    items: { id: string; title: string; sortOrder: number }[];
  }[];
};

const inputClass = 'focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm';

const smallButtonClass =
  'focus-ring inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60';

const smallSecondaryClass =
  'focus-ring inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60';

export function ContentEditor({ course }: { course: CourseContentData }) {
  return (
    <div className="mt-8 space-y-8">
      <OutcomesEditor courseId={course.id} initial={course.learningOutcomes} />
      <SyllabusEditor courseId={course.id} initial={course.syllabusSections} />
    </div>
  );
}

function swap<T>(items: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

function useSavedReset() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function saving() {
    setStatus('saving');
  }

  function idle() {
    setStatus('idle');
  }

  function confirmSaved() {
    setStatus('saved');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  }

  return { status, saving, idle, confirmSaved };
}

type OutcomeRow = { text: string };

function OutcomesEditor({
  courseId,
  initial,
}: {
  courseId: string;
  initial: CourseContentData['learningOutcomes'];
}) {
  const router = useRouter();
  const { status, saving, idle, confirmSaved } = useSavedReset();
  const [rows, setRows] = useState<OutcomeRow[]>(() => initial.map((outcome) => ({ text: outcome.text })));
  const [error, setError] = useState<string | null>(null);
  const isSaving = status === 'saving';

  function updateRow(index: number, text: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { text } : row)));
    idle();
  }

  function addRow() {
    setRows((prev) => [...prev, { text: '' }]);
    idle();
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
    idle();
  }

  function moveRow(index: number, delta: -1 | 1) {
    setRows((prev) => swap(prev, index, delta));
    idle();
  }

  async function save() {
    saving();
    setError(null);
    const outcomes = rows.map((row, sortOrder) => ({ text: row.text.trim(), sortOrder }));

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/outcomes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomes }),
      });
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(body?.message ?? 'Failed to save outcomes');
        idle();
        return;
      }
      confirmSaved();
      router.refresh();
    } catch {
      setError('Network error, try again');
      idle();
    }
  }

  return (
    <section aria-labelledby="learning-outcomes-heading" className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="learning-outcomes-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Learning outcomes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What students gain from the course. Saving replaces the whole list.
          </p>
        </div>
        <button type="button" onClick={addRow} disabled={isSaving} className={smallSecondaryClass}>
          Add outcome
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-md bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          No outcomes yet. Add one above.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-6 flex-none text-right text-sm text-muted-foreground">{index + 1}.</span>
              <input
                value={row.text}
                onChange={(event) => updateRow(index, event.target.value)}
                maxLength={500}
                placeholder="Students will be able to..."
                aria-label={`Outcome ${index + 1}`}
                className={inputClass}
              />
              <div className="flex flex-none items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveRow(index, -1)}
                  disabled={isSaving || index === 0}
                  className={smallButtonClass}
                  aria-label={`Move outcome ${index + 1} up`}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveRow(index, 1)}
                  disabled={isSaving || index === rows.length - 1}
                  className={smallButtonClass}
                  aria-label={`Move outcome ${index + 1} down`}
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={isSaving}
                  className={smallButtonClass}
                  aria-label={`Remove outcome ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className={buttonClass('primary', 'disabled:cursor-not-allowed disabled:opacity-60')}
        >
          {isSaving ? 'Saving...' : 'Save outcomes'}
        </button>
        {status === 'saved' ? (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Saved
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type ItemRow = { title: string };
type SectionRow = { title: string; duration: string; items: ItemRow[] };

function SyllabusEditor({
  courseId,
  initial,
}: {
  courseId: string;
  initial: CourseContentData['syllabusSections'];
}) {
  const router = useRouter();
  const { status, saving, idle, confirmSaved } = useSavedReset();
  const [sections, setSections] = useState<SectionRow[]>(() =>
    initial.map((section) => ({
      title: section.title,
      duration: section.duration ?? '',
      items: section.items.map((item) => ({ title: item.title })),
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const isSaving = status === 'saving';

  function updateSection(index: number, patch: Partial<SectionRow>) {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, ...patch } : section)));
    idle();
  }

  function addSection() {
    setSections((prev) => [...prev, { title: '', duration: '', items: [] }]);
    idle();
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
    idle();
  }

  function moveSection(index: number, delta: -1 | 1) {
    setSections((prev) => swap(prev, index, delta));
    idle();
  }

  function updateItem(sectionIndex: number, itemIndex: number, title: string) {
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex
          ? { ...section, items: section.items.map((item, ii) => (ii === itemIndex ? { title } : item)) }
          : section
      )
    );
    idle();
  }

  function addItem(sectionIndex: number) {
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex ? { ...section, items: [...section.items, { title: '' }] } : section
      )
    );
    idle();
  }

  function removeItem(sectionIndex: number, itemIndex: number) {
    setSections((prev) =>
      prev.map((section, si) =>
        si === sectionIndex ? { ...section, items: section.items.filter((_, ii) => ii !== itemIndex) } : section
      )
    );
    idle();
  }

  async function save() {
    saving();
    setError(null);
    const payload = {
      sections: sections.map((section, sectionIndex) => ({
        title: section.title.trim(),
        duration: section.duration.trim() || undefined,
        sortOrder: sectionIndex,
        items: section.items.map((item, itemIndex) => ({ title: item.title.trim(), sortOrder: itemIndex })),
      })),
    };

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/syllabus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(body?.message ?? 'Failed to save syllabus');
        idle();
        return;
      }
      confirmSaved();
      router.refresh();
    } catch {
      setError('Network error, try again');
      idle();
    }
  }

  return (
    <section aria-labelledby="syllabus-heading" className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="syllabus-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Syllabus
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sections and their lectures. Saving replaces the whole syllabus.
          </p>
        </div>
        <button type="button" onClick={addSection} disabled={isSaving} className={smallSecondaryClass}>
          Add section
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="mt-4 rounded-md bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          No sections yet. Add one above.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="rounded-md border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex min-w-64 flex-1 items-center gap-2">
                  <span className="w-6 flex-none text-right text-sm text-muted-foreground">{sectionIndex + 1}.</span>
                  <input
                    value={section.title}
                    onChange={(event) => updateSection(sectionIndex, { title: event.target.value })}
                    maxLength={500}
                    placeholder="Section title"
                    aria-label={`Section ${sectionIndex + 1} title`}
                    className={inputClass}
                  />
                </div>
                <input
                  value={section.duration}
                  onChange={(event) => updateSection(sectionIndex, { duration: event.target.value })}
                  maxLength={100}
                  placeholder="Duration"
                  aria-label={`Section ${sectionIndex + 1} duration`}
                  className={`${inputClass} w-32`}
                />
                <div className="flex flex-none items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(sectionIndex, -1)}
                    disabled={isSaving || sectionIndex === 0}
                    className={smallButtonClass}
                    aria-label={`Move section ${sectionIndex + 1} up`}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(sectionIndex, 1)}
                    disabled={isSaving || sectionIndex === sections.length - 1}
                    className={smallButtonClass}
                    aria-label={`Move section ${sectionIndex + 1} down`}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    disabled={isSaving}
                    className={smallButtonClass}
                    aria-label={`Remove section ${sectionIndex + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 pl-8">
                {section.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lectures in this section.</p>
                ) : (
                  section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <span className="w-6 flex-none text-right text-xs text-muted-foreground">{itemIndex + 1}.</span>
                      <input
                        value={item.title}
                        onChange={(event) => updateItem(sectionIndex, itemIndex, event.target.value)}
                        maxLength={500}
                        placeholder="Lecture title"
                        aria-label={`Section ${sectionIndex + 1}, lecture ${itemIndex + 1} title`}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(sectionIndex, itemIndex)}
                        disabled={isSaving}
                        className={smallButtonClass}
                        aria-label={`Remove lecture ${itemIndex + 1} from section ${sectionIndex + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
                <button type="button" onClick={() => addItem(sectionIndex)} disabled={isSaving} className={smallSecondaryClass}>
                  Add lecture
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className={buttonClass('primary', 'disabled:cursor-not-allowed disabled:opacity-60')}
        >
          {isSaving ? 'Saving...' : 'Save syllabus'}
        </button>
        {status === 'saved' ? (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Saved
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}