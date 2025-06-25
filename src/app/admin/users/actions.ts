"use server";

import { clerkClient, User as ClerkUser, auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { User as PrismaUser, Prisma } from '@/app/generated/prisma';

export interface DisplayUser extends PrismaUser {
  role?: string;
  email: string;
}

export async function getUsers(): Promise<{ users: DisplayUser[]; error?: string }> {
  try {
    const client = await clerkClient();
    const clerkUserList = await client.users.getUserList({ limit: 500 });

    const dbUsers = await prisma.user.findMany();
    const dbUsersMap = new Map(dbUsers.map((user: PrismaUser) => [user.clerkId, user]));

    const combinedUsers = clerkUserList.data
      .map((clerkUser: ClerkUser): DisplayUser | null => {
        const dbUser = dbUsersMap.get(clerkUser.id);
        if (!dbUser) return null;

        return {
          ...dbUser,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? dbUser.email,
          firstName: clerkUser.firstName || dbUser.firstName,
          lastName: clerkUser.lastName || dbUser.lastName,
          role: clerkUser.publicMetadata?.role as string | undefined,
        };
      })
      .filter((user): user is DisplayUser => user !== null);

    return { users: combinedUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
        return { users: [], error: error.message };
    }
    return { users: [], error: 'No se pudieron cargar los usuarios.' };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: Number(userId) } });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: 'No se pudo eliminar el usuario.' };
  }
}

export async function updateUserArea(userId: string, areaId: number | null) {
  try {
    await prisma.user.update({ where: { id: Number(userId) }, data: { areaId } });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user area:', error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: 'No se pudo actualizar el área del usuario.' };
  }
}

export async function getAreas() {
  return await prisma.area.findMany({ orderBy: { name: 'asc' } });
}

interface UpdateUserPayload {
  id: string;
  firstName: string;
  lastName: string;
  areaId: number | null;
  identification: string | null;
  useGlobalApiKey?: boolean;
  evaluationLimit?: number;
}

export async function updateUserFull(payload: UpdateUserPayload) {
  const { id, firstName, lastName, areaId, identification, useGlobalApiKey, evaluationLimit } = payload;
  const userToUpdate = await prisma.user.findUnique({
    where: { id: Number(id) }
  });

  if (!userToUpdate) {
    return { success: false, error: 'Usuario no encontrado' };
  }
  
  try {
    const dataToUpdate: {
      firstName: string;
      lastName: string;
      areaId: number | null;
      identification: string | null;
      useGlobalApiKey?: boolean;
      evaluationLimit?: number;
    } = {
      firstName,
      lastName,
      areaId,
      identification,
    };

    if (useGlobalApiKey !== undefined) {
      dataToUpdate.useGlobalApiKey = useGlobalApiKey;
    }
    if (evaluationLimit !== undefined) {
      dataToUpdate.evaluationLimit = evaluationLimit;
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'La identificación ingresada ya pertenece a otro usuario.' };
      }
    }
    console.error('Error al actualizar usuario:', error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: 'Ocurrió un error al actualizar el usuario.' };
  }
}

interface ProfileData {
  firstName: string;
  lastName: string;
  identification: string;
}

export async function updateCurrentUserProfile(data: ProfileData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  if (!data.firstName || !data.lastName || !data.identification) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
  }

  try {
    await prisma.user.update({
      where: { clerkId },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        identification: data.identification.trim(),
      },
    });
    
    revalidatePath('/', 'layout'); 

    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'La identificación ingresada ya está en uso. Por favor, utilice otra.' };
      }
    }
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'No se pudo actualizar el perfil. Inténtelo de nuevo.' };
  }
} 