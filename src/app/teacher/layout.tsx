import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CompleteProfileModal } from '@/components/ui/complete-profile-modal';
import { TeacherPanel } from './teacher-panel'; // Componente que crearé a continuación

async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  return await prisma.user.findUnique({ where: { clerkId } });
}

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const isProfileComplete = user?.firstName && user?.lastName && user?.identification;

  return (
    <>
      {user && !isProfileComplete ? (
        <CompleteProfileModal user={user} />
      ) : (
        <TeacherPanel>{children}</TeacherPanel>
      )}
    </>
  );
} 