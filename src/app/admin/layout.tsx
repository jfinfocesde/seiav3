import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CompleteProfileModal } from '@/components/ui/complete-profile-modal';
import { AdminPanel } from './admin-panel';

async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  return await prisma.user.findUnique({ where: { clerkId } });
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const isProfileComplete = user?.firstName && user?.lastName && user?.identification;

  return (
    <>
      {user && !isProfileComplete ? (
        <CompleteProfileModal user={user} />
      ) : (
        <AdminPanel>{children}</AdminPanel>
      )}
    </>
  );
} 