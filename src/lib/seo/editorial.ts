/**
 * buildEditorialNote - produces a short, data-driven "why we're featuring this"
 * blurb rendered on course pages. Gives aggregator pages original editorial
 * copy instead of mirroring the platform's API description.
 */

export interface EditorialNoteFacts {
    title: string;
    instructorName?: string | null;
    rating?: number | null;
    reviewCount?: number;
    platformName: string;
    discountPercent?: number;
    finalPrice?: number;
    verifiedDate?: Date | null;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function buildEditorialNote(facts: EditorialNoteFacts): string {
    const { title, instructorName, rating, reviewCount, platformName } = facts;
    const lead = `We manually reviewed ${title} and verified it as a standout ${platformName} course.`;

    const credentials: string[] = [];
    if (instructorName) {
        credentials.push(`led by instructor ${instructorName}`);
    }
    if (typeof rating === 'number' && rating > 0) {
        const reviews =
            typeof reviewCount === 'number' && reviewCount > 0
                ? ` across ${reviewCount.toLocaleString()} reviews`
                : '';
        credentials.push(`rating ${rating.toFixed(1)}/5${reviews}`);
    }
    const credentialSentence =
        credentials.length > 0 ? ` It's ${credentials.join(' and ')}.` : '';

    let dealSentence = '';
    if (typeof facts.discountPercent === 'number' && facts.discountPercent > 0) {
        if (facts.finalPrice === 0) {
            dealSentence = ` For a limited time it's free — a deal we verified${
                facts.verifiedDate ? ` on ${formatDate(facts.verifiedDate)}` : ''
            }.`;
        } else if (typeof facts.finalPrice === 'number') {
            dealSentence = ` For a limited time it's ${facts.discountPercent}% off at $${facts.finalPrice.toFixed(
                2
            )}${facts.verifiedDate ? ` — a deal we verified on ${formatDate(facts.verifiedDate)}` : ''}.`;
        } else {
            dealSentence = ` For a limited time it's ${facts.discountPercent}% off${
                facts.verifiedDate ? ` — a deal we verified on ${formatDate(facts.verifiedDate)}` : ''
            }.`;
        }
    } else if (facts.verifiedDate) {
        dealSentence = ` We last verified this listing on ${formatDate(facts.verifiedDate)}.`;
    }

    return `${lead}${credentialSentence}${dealSentence}`;
}