'use server';

import { PrismaClient } from '@/app/generated/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { encrypt, decrypt } from '@/lib/crypto';

const prisma = new PrismaClient();

// Obtener la información del usuario actual
export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (user && user.geminiApiKey) {
    return {
      ...user,
      geminiApiKey: decrypt(user.geminiApiKey),
    };
  }

  return user;
}

// Actualizar perfil del usuario
export async function updateTeacherProfile(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error('Not authenticated');
  }

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const identification = formData.get('identification') as string;

  await prisma.user.update({
    where: { clerkId },
    data: {
      firstName,
      lastName,
      identification,
    },
  });

  revalidatePath('/teacher/settings');
}

// Actualizar la API Key de Gemini del usuario
export async function updateTeacherApiKey(formData: FormData) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new Error('Not authenticated');
    }
    
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.useGlobalApiKey) {
        throw new Error('Permission denied to update API key.');
    }
  
    const apiKey = formData.get('geminiApiKey') as string;
    const useGlobal = !apiKey;
  
    await prisma.user.update({
      where: { clerkId },
      data: {
        geminiApiKey: apiKey ? encrypt(apiKey) : null,
        useGlobalApiKey: useGlobal,
      },
    });
  
    revalidatePath('/teacher/settings');
  } 