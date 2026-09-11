import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { LoginForm } from '@/components/login-form';
import { isAdmin } from '@/lib/supabase';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the SearchCourse admin console.',
  alternates: { canonical: siteUrl('/login') },
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) {
    redirect('/admin');
  }

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Restricted area. Only administrators have access.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </Container>
  );
}