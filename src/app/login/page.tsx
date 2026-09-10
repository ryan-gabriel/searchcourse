'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const supabase = createSupabaseBrowserClient();
    const redirectParam = searchParams.get('redirectTo');
    // Only allow internal single-slash paths (block //host, /\ and external schemes)
    const redirectTo =
        redirectParam &&
        redirectParam.startsWith('/') &&
        !redirectParam.startsWith('//') &&
        !redirectParam.startsWith('/\\')
            ? redirectParam
            : '/admin';

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user && user.user_metadata?.is_admin === true) {
                router.push(redirectTo);
            }
        };
        checkAuth();
    }, [supabase, router, redirectTo]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('Invalid credentials');
            setLoading(false);
            return;
        }

        if (data.user?.user_metadata?.is_admin !== true) {
            await supabase.auth.signOut();
            setError('Access denied. Admin privileges required.');
            setLoading(false);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="bg-surface rounded-2xl border border-border p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-accent text-accent-ink rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
                        <p className="text-muted text-sm mt-2">
                            Authorized personnel only
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                            <p className="text-danger text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-muted border border-border rounded-lg text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-foreground/40 text-xs mt-6">
                    This area is restricted to authorized administrators.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
