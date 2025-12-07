'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    // Check if user just registered
    const registered = searchParams.get('registered') === 'true';

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(registered ? 'Account created! Please sign in.' : '');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        signIn('google', { callbackUrl: '/' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                // LOGIN Logic
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    setError('Invalid email or password');
                    setIsLoading(false);
                } else {
                    router.push('/');
                    router.refresh();
                }
            } else {
                // SIGNUP Logic
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }

                if (formData.password.length < 8) {
                    setError('Password must be at least 8 characters');
                    setIsLoading(false);
                    return;
                }

                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Failed to create account');
                    setIsLoading(false);
                } else {
                    setSuccess('Account created successfully! Please sign in.');
                    setIsLogin(true); // Switch to login mode
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="glass-card p-8 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25 mb-4">
                                <span className="text-3xl">🏥</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {isLogin ? t('auth.welcome') : t('auth.create')}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isLogin ? t('auth.signInDesc') : t('auth.join')}
                            </p>
                        </div>

                        {/* Toggle */}
                        <div className="flex mb-6 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <button
                                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin
                                    ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {t('auth.signin')}
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin
                                    ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {t('auth.signup')}
                            </button>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-200 text-green-600 text-sm text-center">
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('auth.name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        placeholder="Juan dela Cruz"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {t('auth.email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="juan@example.com"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {t('auth.password')}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    minLength={8}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('auth.confirmPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    />
                                </div>
                            )}

                            {isLogin && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-sm text-teal-600 hover:underline">
                                        {t('auth.forgot')}
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Please wait...' : (isLogin ? t('auth.signin') : t('auth.create'))}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">{t('auth.or')}</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isLogin ? t('auth.googleSignIn') : t('auth.googleSignUp')}
                                </span>
                            </button>
                        </div>

                        {/* Guest */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/chat"
                                className="text-sm text-slate-500 hover:text-teal-600 transition-colors"
                            >
                                {t('auth.guest')} →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gabay-teal"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
