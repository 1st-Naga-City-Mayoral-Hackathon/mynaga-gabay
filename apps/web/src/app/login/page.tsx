'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual auth
        window.location.href = '/chat';
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="glass-card p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gabay-teal to-teal-500 shadow-lg shadow-gabay-teal/25 mb-4">
                                <span className="text-3xl">🏥</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isLogin ? 'Sign in to continue to Gabay' : 'Join MyNaga Gabay today'}
                            </p>
                        </div>

                        {/* Toggle */}
                        <div className="flex mb-6 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin
                                        ? 'bg-white dark:bg-slate-700 text-gabay-teal shadow-sm'
                                        : 'text-slate-500'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin
                                        ? 'bg-white dark:bg-slate-700 text-gabay-teal shadow-sm'
                                        : 'text-slate-500'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Juan dela Cruz"
                                        className="glass-input"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="juan@example.com"
                                    className="glass-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="glass-input"
                                />
                            </div>

                            {isLogin && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-sm text-gabay-teal hover:underline">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <button type="submit" className="glass-button w-full">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="glass-button-secondary py-2.5 text-sm">
                                <span className="mr-2">📱</span> Phone
                            </button>
                            <button className="glass-button-secondary py-2.5 text-sm">
                                <span className="mr-2">🔵</span> Google
                            </button>
                        </div>

                        {/* Guest */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/chat"
                                className="text-sm text-slate-500 hover:text-gabay-teal"
                            >
                                Continue as guest →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
