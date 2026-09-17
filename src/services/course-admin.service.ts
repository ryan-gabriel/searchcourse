/**
 * Course Admin Service
 *
 * Write operations for the admin CMS: course CRUD and learning-outcome
 * replacement. Read paths live in course.service.ts.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { CourseCreateInput, CourseUpdateInput } from '@/validations';

/**
 * Get course content for the admin content editor
 * Includes learning outcomes
 */
export async function getCourseContent(id: string) {
    return prisma.course.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            slug: true,
            learningOutcomes: {
                orderBy: { sortOrder: 'asc' },
                select: { id: true, text: true, sortOrder: true },
            },
        },
    });
}

export async function createCourse(data: CourseCreateInput) {
    return prisma.course.create({
        data: {
            ...data,
            originalPrice: new Prisma.Decimal(data.originalPrice),
            rating: data.rating ? new Prisma.Decimal(data.rating) : null,
        },
    });
}

export async function updateCourse({ id, ...data }: CourseUpdateInput) {
    return prisma.course.update({
        where: { id },
        data: {
            ...data,
            ...(data.originalPrice && {
                originalPrice: new Prisma.Decimal(data.originalPrice),
            }),
            ...(data.rating !== undefined && {
                rating: data.rating ? new Prisma.Decimal(data.rating) : null,
            }),
        },
    });
}

/**
 * Delete a course (soft delete preferrable, but hard delete for now)
 */
export async function deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
}

/**
 * Update course learning outcomes (Full Replace)
 */
export async function updateCourseLearningOutcomes(
    courseId: string,
    outcomes: { text: string; sortOrder: number }[]
) {
    return prisma.$transaction(async (tx) => {
        await tx.courseLearningOutcome.deleteMany({
            where: { courseId },
        });

        if (outcomes.length > 0) {
            await tx.courseLearningOutcome.createMany({
                data: outcomes.map((o) => ({
                    courseId,
                    text: o.text,
                    sortOrder: o.sortOrder,
                })),
            });
        }

        return tx.courseLearningOutcome.findMany({ where: { courseId }, orderBy: { sortOrder: 'asc' } });
    });
}