'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Route, Tags, Ticket, Monitor, BarChart3, Settings, LogOut } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/roadmaps', label: 'Roadmaps', icon: Route },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/platforms', label: 'Platforms', icon: Monitor },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <nav aria-label="Admin">
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 border-t border-border pt-4">
        <p className="px-3 text-xs text-muted-foreground">{userEmail}</p>
        <button
          type="button"
          onClick={signOut}
          className="focus-ring mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}