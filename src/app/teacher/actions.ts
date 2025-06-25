"use server";

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// ... (otras acciones existentes)

export async function getTeacherDashboardStats() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Usuario no autenticado.");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      firstName: true,
      evaluationLimit: true,
      _count: {
        select: {
          evaluations: true,
        }
      }
    }
  });

  if (!user) {
    throw new Error("Usuario no encontrado en la base de datos.");
  }
  
  const activeSchedules = await prisma.attempt.count({
    where: {
      evaluation: {
        authorId: user.id,
      },
      endTime: {
        gte: new Date(),
      }
    }
  });
  
  return {
    firstName: user.firstName,
    evaluationCount: user._count.evaluations,
    evaluationLimit: user.evaluationLimit,
    activeSchedules,
  };
} 