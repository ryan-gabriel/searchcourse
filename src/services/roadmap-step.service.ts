/**
 * Roadmap Step Service
 *
 * Step mutations for learning paths. Kept separate from roadmap reads so the
 * course-count bookkeeping (every add/remove adjusts courseCount) lives in one
 * place.
 */

import prisma from '@/lib/prisma';
import type { RoadmapStepCreateInput } from '@/validations';

export async function addRoadmapStep(data: RoadmapStepCreateInput) {
    const step = await prisma.roadmapStep.create({ data });

    await prisma.roadmap.update({
        where: { id: data.roadmapId },
        data: { courseCount: { increment: 1 } },
    });

    return step;
}

export async function removeRoadmapStep(stepId: string) {
    const step = await prisma.roadmapStep.findUnique({
        where: { id: stepId },
        select: { roadmapId: true },
    });

    if (!step) {
        throw new Error('Step not found');
    }

    await prisma.roadmapStep.delete({ where: { id: stepId } });

    await prisma.roadmap.update({
        where: { id: step.roadmapId },
        data: { courseCount: { decrement: 1 } },
    });
}

export async function reorderRoadmapSteps(
    roadmapId: string,
    stepOrder: { id: string; orderIndex: number }[]
) {
    await prisma.$transaction(
        stepOrder.map(({ id, orderIndex }) =>
            prisma.roadmapStep.update({
                where: { id },
                data: { orderIndex },
            })
        )
    );
}