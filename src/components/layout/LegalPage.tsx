/**
 * LegalPage - shared server component for simple legal/static pages.
 */

interface LegalSection {
    heading: string;
    body: string[];
}

interface LegalPageProps {
    title: string;
    updated: string;
    description: string;
    sections: LegalSection[];
}

export function LegalPage({
    title,
    updated,
    description,
    sections,
}: LegalPageProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="bg-surface border-b border-border">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        {title}
                    </h1>
                    <p className="text-sm text-muted">Last updated: {updated}</p>
                    <p className="text-foreground/60 mt-4">{description}</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-10">
                    {sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-xl font-bold text-foreground mb-4">
                                {section.heading}
                            </h2>
                            <div className="space-y-3">
                                {section.body.map((paragraph) => (
                                    <p
                                        key={paragraph.slice(0, 48)}
                                        className="text-sm text-foreground/70 leading-relaxed"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}