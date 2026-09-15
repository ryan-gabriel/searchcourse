/**
 * Seed Canonical Categories Job
 *
 * Pre-populates the curated course categories (icon, sort order, description)
 * used by the public /courses filter and by the scraper's auto-category-mapping.
 * Idempotent: existing categories are never touched or overwritten.
 *
 * Usage: npx tsx src/jobs/seed-categories.ts
 */

import { pathToFileURL } from 'url';
import { prisma } from "@/lib/prisma";
import { seedCanonicalCategories } from './lib/categories';

async function main() {
    const before = await prisma.category.count();
    await seedCanonicalCategories();
    const after = await prisma.category.count();
    console.log(`✅ Categories ready: ${before} -> ${after} (created ${after - before})`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main()
        .catch((error) => {
            console.error('❌ Seed failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}