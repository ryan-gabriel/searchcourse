/**
 * Category Mapping Helper
 *
 * Maps scraped category strings (Discudemy granular topics, Tutorialbar
 * Udemy categories) onto database categories.
 *
 * Resolution order:
 * 1. Curated alias table (scraped name -> canonical category slug).
 * 2. Exact slug match against existing categories.
 * 3. Case-insensitive name/substring match.
 * 4. Auto-create a category from the scraped name, so every scraped
 *    course gets a real categoryId instead of a null.
 *
 * Returns null only when the scraped value is missing.
 */

import { prisma } from "@/lib/prisma";

// Curated aliases: scraped category string -> canonical category slug.
// Covers the two sources' known vocabularies so auto-created categories
// stay few and intentional.
const CATEGORY_ALIASES: Record<string, string> = {
  // Discudemy granular topics
  'python': 'programming',
  'javascript': 'programming',
  'java': 'programming',
  'php': 'programming',
  'ruby': 'programming',
  'go': 'programming',
  'rust': 'programming',
  'c++': 'programming',
  'c#': 'programming',
  'c': 'programming',
  'sql': 'data-science',
  'data science': 'data-science',
  'machine learning': 'data-science',
  'artificial intelligence': 'data-science',
  'chatgpt': 'artificial-intelligence',
  'aws': 'cloud-computing',
  'docker': 'cloud-computing',
  'kubernetes': 'cloud-computing',
  'devops': 'cloud-computing',
  'linux': 'cloud-computing',
  'react': 'front-end',
  'react native': 'front-end',
  'vue': 'front-end',
  'angular': 'front-end',
  'html': 'front-end',
  'css': 'front-end',
  'wordpress': 'web-development',
  'web development': 'web-development',
  'node.js': 'back-end',
  'express': 'back-end',
  'django': 'back-end',
  'flask': 'back-end',
  'flutter': 'mobile-development',
  'android': 'mobile-development',
  'ios': 'mobile-development',
  'swift': 'mobile-development',
  'kotlin': 'mobile-development',
  'cybersecurity': 'cybersecurity',
  'ethical hacking': 'cybersecurity',
  'network': 'networking',
  'ui ux': 'design',
  'photoshop': 'design',
  'design': 'design',
  'finance': 'finance-accounting',
  'accounting': 'finance-accounting',
  'marketing': 'marketing',
  'seo': 'marketing',
  'digital marketing': 'marketing',
  'sales': 'marketing',
  'business': 'business',
  'entrepreneurship': 'business',
  'project management': 'business',
  'personal development': 'personal-development',
  'productivity': 'personal-development',
  'health': 'health-fitness',
  'fitness': 'health-fitness',
  'photography': 'photography-video',
  'videography': 'photography-video',
  'video editing': 'photography-video',
  'music': 'music',
  'gaming': 'gaming',
  'test prep': 'test-prep',
  'it & software': 'it-and-software',
  'development': 'development',
};

// Canonical categories with editorial metadata. Auto-created categories not
// listed here get default iconName/sortOrder/description.
const CANONICAL_CATEGORIES: {
  name: string;
  slug: string;
  iconName: string;
  sortOrder: number;
  description: string;
}[] = [
  { name: 'Development', slug: 'development', iconName: 'Code2', sortOrder: 5, description: 'Programming and software development' },
  { name: 'Programming', slug: 'programming', iconName: 'Code', sortOrder: 10, description: 'Languages and coding fundamentals' },
  { name: 'Web Development', slug: 'web-development', iconName: 'Globe', sortOrder: 15, description: 'Front-end, back-end, and full-stack' },
  { name: 'Front-End', slug: 'front-end', iconName: 'LayoutTemplate', sortOrder: 20, description: 'HTML, CSS, JavaScript, and UI frameworks' },
  { name: 'Back-End', slug: 'back-end', iconName: 'Server', sortOrder: 25, description: 'APIs, databases, and server-side code' },
  { name: 'Mobile Development', slug: 'mobile-development', iconName: 'Smartphone', sortOrder: 30, description: 'iOS, Android, and cross-platform' },
  { name: 'Data Science', slug: 'data-science', iconName: 'Database', sortOrder: 35, description: 'Data analysis, ML, and AI' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', iconName: 'BrainCircuit', sortOrder: 40, description: 'AI, LLMs, and applied machine learning' },
  { name: 'Cloud Computing', slug: 'cloud-computing', iconName: 'Cloud', sortOrder: 45, description: 'AWS, Azure, GCP, and DevOps tooling' },
  { name: 'Cybersecurity', slug: 'cybersecurity', iconName: 'ShieldCheck', sortOrder: 50, description: 'Security, network protection, and ethical hacking' },
  { name: 'Networking', slug: 'networking', iconName: 'Network', sortOrder: 55, description: 'Networks, protocols, and infrastructure' },
  { name: 'IT & Software', slug: 'it-and-software', iconName: 'MonitorCog', sortOrder: 60, description: 'System administration and IT fundamentals' },
  { name: 'Design', slug: 'design', iconName: 'Palette', sortOrder: 65, description: 'UI/UX, graphic design, and creative tools' },
  { name: 'Business', slug: 'business', iconName: 'Briefcase', sortOrder: 70, description: 'Strategy, management, and operations' },
  { name: 'Finance & Accounting', slug: 'finance-accounting', iconName: 'TrendingUp', sortOrder: 75, description: 'Finance, investing, and accounting' },
  { name: 'Marketing', slug: 'marketing', iconName: 'Megaphone', sortOrder: 80, description: 'Digital marketing, SEO, and growth' },
  { name: 'Personal Development', slug: 'personal-development', iconName: 'UserRound', sortOrder: 85, description: 'Productivity, mindset, and soft skills' },
  { name: 'Health & Fitness', slug: 'health-fitness', iconName: 'HeartPulse', sortOrder: 90, description: 'Fitness, nutrition, and wellbeing' },
  { name: 'Photography & Video', slug: 'photography-video', iconName: 'Camera', sortOrder: 95, description: 'Photography, film, and editing' },
  { name: 'Music', slug: 'music', iconName: 'Music', sortOrder: 100, description: 'Music production, instruments, and theory' },
  { name: 'Gaming', slug: 'gaming', iconName: 'Gamepad2', sortOrder: 105, description: 'Game development and design' },
  { name: 'Test Prep', slug: 'test-prep', iconName: 'GraduationCap', sortOrder: 110, description: 'Certifications and exam preparation' },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'uncategorized';
}

// Cache categories to avoid repeated DB queries
let categoryCache: { id: string; name: string; slug: string }[] | null = null;

export async function getCategoryMap() {
    if (categoryCache) return categoryCache;

    const cats = await prisma.category.findMany({
        select: { id: true, name: true, slug: true },
    });

    categoryCache = cats;
    return cats;
}

function invalidateCache(): void {
    categoryCache = null;
}

async function seedCanonicalCategoriesIfMissing(): Promise<void> {
    const existing = await prisma.category.findMany({ select: { slug: true } });
    const existingSlugs = new Set(existing.map((c) => c.slug));

    const missing = CANONICAL_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));
    if (missing.length === 0) return;

    await prisma.category.createMany({
        data: missing.map((c) => ({
            name: c.name,
            slug: c.slug,
            iconName: c.iconName,
            sortOrder: c.sortOrder,
            description: c.description,
        })),
        skipDuplicates: true,
    });
    invalidateCache();
}

/**
 * Seed the canonical category set (idempotent). Safe to run any time.
 */
export async function seedCanonicalCategories(): Promise<void> {
    await seedCanonicalCategoriesIfMissing();
}

/**
 * Map a scraped category string to an existing category, creating one when
 * no match exists. Returns null only when the input is missing/blank.
 */
export async function mapCategory(value: string | undefined | null): Promise<string | null> {
    if (!value) return null;

    const scraped = value.trim();
    const alias = CATEGORY_ALIASES[scraped.toLowerCase()];
    const target = alias ?? scraped;
    const desiredSlug = slugify(target);

    // 1. Curated/auto-created canonical base (ensures the nice categories exist)
    await seedCanonicalCategoriesIfMissing();

    const categories = await getCategoryMap();

    // 2. Exact slug match (canonical or previously auto-created)
    const bySlug = categories.find((c) => c.slug === desiredSlug);
    if (bySlug) return bySlug.id;

    // 3. Case-insensitive name / substring match
    const targetLower = target.toLowerCase();
    const byName = categories.find((c) => c.name.toLowerCase() === targetLower);
    if (byName) return byName.id;
    const byContains = categories.find(
        (c) =>
            c.name.toLowerCase().includes(targetLower) ||
            targetLower.includes(c.name.toLowerCase())
    );
    if (byContains) return byContains.id;

    // 4. Auto-create the missing category so nothing stays uncategorized
    const canonical = CANONICAL_CATEGORIES.find((c) => c.slug === desiredSlug);
    const created = await prisma.category.create({
        data: {
            name: canonical?.name ?? target,
            slug: desiredSlug,
            iconName: canonical?.iconName ?? 'Tag',
            sortOrder: canonical?.sortOrder ?? 1000 + (target.length % 100),
        },
    });
    invalidateCache();
    return created.id;
}