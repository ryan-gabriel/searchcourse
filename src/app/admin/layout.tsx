import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin-nav';
import { getAdminUser } from '@/lib/supabase';

export const metadata: Metadata = {
  title: { default: 'Admin · SearchCourse', template: '%s · SearchCourse' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <AdminNav userEmail={user.email ?? ''} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}