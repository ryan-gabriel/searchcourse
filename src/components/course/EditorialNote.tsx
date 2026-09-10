/**
 * EditorialNote - "Why we're featuring this" blurb for manually vetted
 * courses. Renders original, data-driven editorial copy.
 */

import { ShieldCheck } from 'lucide-react';
import { buildEditorialNote, type EditorialNoteFacts } from '@/lib/seo/editorial';

export function EditorialNote({ facts }: { facts: EditorialNoteFacts }) {
    const note = buildEditorialNote(facts);

    return (
        <section className="mb-10 rounded-2xl border border-border bg-surface-muted p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground mb-3 font-display">
                <ShieldCheck className="w-5 h-5 text-price" />
                Why we&apos;re featuring this
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed">{note}</p>
        </section>
    );
}