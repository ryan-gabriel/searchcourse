/**
 * Seed Content Job
 *
 * Fills the gaps that leave the public site looking empty:
 *  1. Roadmap steps (all roadmaps currently have 0 RoadmapStep rows)
 *  2. Featured course flags (homepage "Featured courses" section is an empty state)
 *  3. Course learning outcomes ("What you'll learn" missing on most course pages)
 *
 * Attribution is deterministic: steps/categories are curated per roadmap slug,
 * featured picks are explicit slugs, and outcomes are derived from existing
 * cached headline/description text. Idempotent for steps & outcomes; featured
 * flags only ever get flipped to true.
 *
 * Usage: npx tsx src/jobs/seed-content.ts
 */

import "dotenv/config";
import { pathToFileURL } from 'url';
import { prisma } from "@/lib/prisma";

// ============================================
// ROADMAP CONTENT
// ============================================

interface RoadmapSeed {
    categorySlug?: string;
    courseSlugs: string[];
}

/** Curated course slugs per roadmap (all verified active in the DB). */
const ROADMAP_STEPS: Record<string, RoadmapSeed> = {
    'ai-ml-engineer': {
        categorySlug: 'data-science',
        courseSlugs: [
            'ai-foundations',
            'python-with-machine-learning-start-building-ai-models-today',
            'introduction-to-rag-retrieval-augmented-generation',
            'agentic-ai-ai-agents-rag-mcp-certification-prep-6-exams',
        ],
    },
    'backend-developer': {
        categorySlug: 'development',
        courseSlugs: [
            'java-programming-masterclass-beginner-to-master',
            'the-ultimate-c-bootcamp-build-modern-web-api-apps',
            'python-and-django-framework-for-beginners-complete-course',
            'php-oop-with-mysql-build-restaurant-management-system',
            'postgresql-for-developers-design-query-scale-databases',
        ],
    },
    'cloud-engineer': {
        categorySlug: 'it-and-software',
        courseSlugs: [
            'aws-certified-solutions-architect-associate-saa-c03-6-exams',
            'az-104-microsoft-azure-administrator-certification-exam',
            'dca-docker-certified-associate-practice-tests-2026',
            '600-cloud-computing-interview-questions-practice-test',
        ],
    },
    'cybersecurity-specialist': {
        categorySlug: 'cybersecurity',
        courseSlugs: [
            'ethical-hacking-practical-cert-bootcamp-real-hands-on-labs',
            'mastering-comptia-secai',
            'cissp-certification-mock-exams-practice-tests-1500-qns',
        ],
    },
    'data-scientist': {
        categorySlug: 'data-science',
        courseSlugs: [
            'data-analysis-with-python-a-to-z-arabic',
            'hands-on-r-programming-build-real-world-data-projects',
            'ai-foundations',
            'python-with-machine-learning-start-building-ai-models-today',
        ],
    },
    'devops-engineer': {
        categorySlug: 'it-and-software',
        courseSlugs: [
            'dca-docker-certified-associate-practice-tests-2026',
            'aws-certified-devops-engineer-professional-exam-2026',
            'linux-administration-bash-scripting-practice-exams',
            '600-cloud-computing-interview-questions-practice-test',
        ],
    },
    'frontend-developer': {
        categorySlug: 'front-end',
        courseSlugs: [
            'css-the-complete-guide-to-css-for-beginners',
            'aprender-html5-sin-dolor',
            '600-es6-interview-questions-practice-test',
            'typescript-ultimate-practice-test-prepare-practice-pass',
        ],
    },
    'full-stack-web-developer': {
        categorySlug: 'web-development',
        courseSlugs: [
            'full-stack-python-architect-fast-api-react-vibe-coding',
            'javascript-and-php-and-python-programming-complete-course',
            'css-javascript-and-python-complete-course',
            'nextjs-masterclass-learn-nextjs-by-building-modern-web-app',
            'php-oop-with-mysql-build-restaurant-management-system',
            'the-ultimate-c-bootcamp-build-modern-web-api-apps',
        ],
    },
    'game-developer': {
        categorySlug: 'game-development',
        courseSlugs: [
            'blender-essential-from-beginner-to-3d-masterclass',
            'essential-after-effects-from-beginner-to-motion-master',
            'fusion-360-for-beginners-3d-design-modeling-assembly',
        ],
    },
    'mobile-app-developer': {
        categorySlug: 'development',
        courseSlugs: [
            'java-programming-masterclass-beginner-to-master',
            'figma-essential-for-user-interface-and-user-experience-ui-ux',
            'uiux-design-figma-mastery-product-design-tests',
            'learn-ui-ux-design-adobe-xd-learn-user-experience-design',
        ],
    },
};

// ============================================
// FEATURED COURSES
// ============================================

/** High-traction active courses flagged as homepage featured highlights. */
const FEATURED_COURSE_SLUGS = [
    'microsoft-excel-excel-beginner-to-advance-to-pro-2026',
    'iso-45001-occupational-health-safety-management-system',
    'master-servicenow-admin-development-from-basic-to-pro-2026',
    'css-javascript-and-python-complete-course',
    'figma-essential-for-user-interface-and-user-experience-ui-ux',
    'javascript-and-php-and-python-programming-complete-course',
    'product-owner-certification',
    'agile-project-management-scrum-kanban-and-sprints',
];

// ============================================
// LEARNING OUTCOMES
// ============================================

function splitHeadline(headline: string): string[] {
    const parts = headline
        .split(/\s*\|\s*/)
        .flatMap((part) => part.split(/\s*,\s*/))
        .map((part) => part.trim().replace(/\s+/g, ' '))
        .filter((part) => part.length >= 4 && part.length <= 500);
    const seen = new Set<string>();
    return parts.filter((part) => {
        const key = part.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function splitDescription(description: string): string[] {
    const sentences = description
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim().replace(/\s+/g, ' '))
        .filter((s) => s.length >= 20 && s.length <= 500);
    const seen = new Set<string>();
    return sentences.filter((s) => {
        const key = s.toLowerCase().slice(0, 80);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ============================================
// RUN
// ============================================

async function seedRoadmapSteps() {
    console.log('\n🧭 Seeding roadmap steps...');
    const map = ROADMAP_STEPS;
    const slugs = Object.keys(map);
    const roadmaps = await prisma.roadmap.findMany({
        where: { slug: { in: slugs } },
        select: { id: true, slug: true, title: true },
    });
    if (roadmaps.length !== slugs.length) {
        const missing = slugs.filter((s) => !roadmaps.some((r) => r.slug === s));
        throw new Error(`Missing roadmaps in DB: ${missing.join(', ')}`);
    }

    const courseSlugs = [...new Set(Object.values(map).flatMap((m) => m.courseSlugs))];
    const courses = await prisma.course.findMany({
        where: { slug: { in: courseSlugs } },
        select: { id: true, slug: true, title: true, isActive: true },
    });
    if (courses.length !== courseSlugs.length) {
        const missing = courseSlugs.filter((s) => !courses.some((c) => c.slug === s));
        throw new Error(`Missing courses in DB: ${missing.join(', ')}`);
    }
    const courseById = new Map(courses.map((c) => [c.slug, c]));

    let stepsCreated = 0;
    let categoriesAssigned = 0;

    for (const roadmap of roadmaps) {
        const seed = map[roadmap.slug];
        const orderIndexStart = 0;

        const existing = await prisma.roadmapStep.findMany({
            where: { roadmapId: roadmap.id },
            select: { id: true },
        });
        if (existing.length) {
            console.log(`   - ${roadmap.title}: already has ${existing.length} steps, skipping`);
            continue;
        }

        await prisma.$transaction(async (tx) => {
            for (const [i, courseSlug] of seed.courseSlugs.entries()) {
                const course = courseById.get(courseSlug)!;
                await tx.roadmapStep.create({
                    data: {
                        roadmapId: roadmap.id,
                        courseId: course.id,
                        title: course.title,
                        orderIndex: orderIndexStart + i,
                        description: `Core ${roadmap.title.toLowerCase().replace('-', ' ')} skill taught through this course.`,
                    },
                });
                stepsCreated++;
            }
        });

        if (seed.categorySlug) {
            const category = await prisma.category.findUnique({
                where: { slug: seed.categorySlug },
                select: { id: true },
            });
            if (category) {
                await prisma.roadmap.update({
                    where: { id: roadmap.id },
                    data: {
                        categoryId: category.id,
                        courseCount: seed.courseSlugs.length,
                    },
                });
                categoriesAssigned++;
            }
        } else {
            await prisma.roadmap.update({
                where: { id: roadmap.id },
                data: { courseCount: seed.courseSlugs.length },
            });
        }

        console.log(`   - ${roadmap.title}: added ${seed.courseSlugs.length} steps`);
    }

    console.log(`   ✅ ${stepsCreated} steps created, ${categoriesAssigned} categories assigned`);
}

async function seedFeaturedCourses() {
    console.log('\n⭐ Flagging featured courses...');
    const { count } = await prisma.course.updateMany({
        where: {
            slug: { in: FEATURED_COURSE_SLUGS },
            isActive: true,
            isFeatured: false,
        },
        data: { isFeatured: true },
    });
    console.log(`   ✅ ${count} courses flagged as featured`);
}

async function seedLearningOutcomes() {
    console.log('\n🎯 Generating learning outcomes...');
    const courses = await prisma.course.findMany({
        where: {
            isActive: true,
            learningOutcomes: { none: {} },
        },
        select: {
            id: true,
            title: true,
            headline: true,
            description: true,
        },
    });
    console.log(`   - ${courses.length} active courses with no outcomes to process`);

    let created = 0;
    let withOutcomes = 0;

    for (const course of courses) {
        const fromHeadline = course.headline ? splitHeadline(course.headline) : [];
        const fromDescription = course.description ? splitDescription(course.description) : [];
        const outcomes = [...fromHeadline, ...fromDescription].slice(0, 5);
        if (!outcomes.length) continue;

        await prisma.courseLearningOutcome.createMany({
            data: outcomes.map((text, i) => ({
                courseId: course.id,
                text,
                sortOrder: i,
            })),
        });
        created += outcomes.length;
        withOutcomes++;
    }

    console.log(`   ✅ ${created} outcomes across ${withOutcomes} courses`);
}

async function main() {
    const start = Date.now();
    await seedRoadmapSteps();
    await seedFeaturedCourses();
    await seedLearningOutcomes();
    console.log(`\n🎉 Content seed complete in ${((Date.now() - start) / 1000).toFixed(1)}s`);
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