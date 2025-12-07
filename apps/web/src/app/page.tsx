'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
    const [mounted, setMounted] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || status === 'loading') {
        return <LandingPageSkeleton />;
    }

    if (session) {
        return <Dashboard session={session} />;
    }

    return <LandingPage />;
}

function Dashboard({ session }: { session: any }) {
    const { t } = useLanguage();
    const user = session.user;

    const quickActions = [
        {
            href: '/chat',
            title: t('nav.chat'),
            desc: t('chat.description'),
            icon: '💬',
            color: 'bg-teal-500',
        },
        {
            href: '/facilities',
            title: t('nav.facilities'),
            desc: t('feature.facilities.desc'),
            icon: '🏥',
            color: 'bg-blue-500',
        },
        {
            href: '/medications',
            title: t('nav.medications'),
            desc: t('feature.medications.desc'),
            icon: '💊',
            color: 'bg-rose-500',
        },
        {
            href: '/philhealth',
            title: t('nav.philhealth'),
            desc: t('feature.philhealth.desc'),
            icon: '📋',
            color: 'bg-yellow-500',
        },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Welcome Section */}
                <section className="mb-12">
                    <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {t('auth.welcome')}, {user?.name}! 👋
                            </h1>
                            <p className="text-teal-100 text-lg max-w-xl">
                                {t('dashboard.subtitle')}
                            </p>
                            <Link
                                href="/chat"
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-teal-700 rounded-xl font-bold hover:bg-teal-50 transition-colors shadow-lg shadow-black/10"
                            >
                                <span>{t('dashboard.startChat')}</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <h2 className="text-xl font-bold text-foreground mb-6">{t('dashboard.quickActions')}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="glass-card p-6 hover:scale-[1.02] transition-transform duration-200 group"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:shadow-lg transition-shadow`}>
                                {action.icon}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{action.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {action.desc}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity / Suggestions */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Chats */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">{t('chat.recentChats')}</h2>
                            <Link href="/chat" className="text-sm text-teal-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {/* Placeholder for recent chats */}
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center text-sm">💬</div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Common flu symptoms</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center text-sm">💬</div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Nearest pharmacy</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Health Tips / Updates */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">{t('dashboard.healthInfo')}</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">📢</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">{t('dashboard.healthOffice')}</h3>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            {t('dashboard.announcement')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function LandingPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero Section */}
                <section className="text-center py-12 md:py-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        {t('landing.badge')}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        {t('landing.hero.title')}{' '}
                        <span className="gradient-text">{t('landing.hero.highlight')}</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        {t('landing.hero.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login" className="glass-button text-lg px-8 py-4">
                            🚀 {t('landing.hero.signin')}
                        </Link>
                        <Link href="/about" className="glass-button-secondary text-lg px-8 py-4">
                            ℹ️ {t('nav.about')}
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-12">
                    <h2 className="text-2xl font-bold text-center text-foreground mb-8">
                        {t('landing.features.title')}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon="🏥"
                            title={t('feature.facilities.title')}
                            description={t('feature.facilities.desc')}
                        />
                        <FeatureCard
                            icon="💊"
                            title={t('feature.medications.title')}
                            description={t('feature.medications.desc')}
                        />
                        <FeatureCard
                            icon="📋"
                            title={t('feature.philhealth.title')}
                            description={t('feature.philhealth.desc')}
                        />
                        <FeatureCard
                            icon="🗣️"
                            title={t('feature.voice.title')}
                            description={t('feature.voice.desc')}
                        />
                        <FeatureCard
                            icon="📸"
                            title={t('feature.scanner.title')}
                            description={t('feature.scanner.desc')}
                        />
                        <FeatureCard
                            icon="🤖"
                            title={t('feature.ai.title')}
                            description={t('feature.ai.desc')}
                        />
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-12 text-center">
                    <div className="glass-card p-8 max-w-3xl mx-auto">
                        <h3 className="text-xl font-semibold text-foreground mb-4">
                            {t('landing.trust.title')}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {t('landing.trust.description')}
                        </p>
                        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                            <div>
                                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">6+</div>
                                {t('landing.stats.facilities')}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">3</div>
                                {t('landing.stats.languages')}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">24/7</div>
                                {t('landing.stats.available')}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© 2024 MyNaga Gabay | 1st Naga City Mayoral Hackathon</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <Link href="/about" className="hover:text-primary">{t('nav.about')}</Link>
                        <Link href="/login" className="hover:text-primary">{t('auth.signin')}</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function LandingPageSkeleton() {
    return (
        <main className="min-h-screen flex flex-col">
            <div className="h-16 border-b bg-background" />
            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center py-12 md:py-20 animate-pulse">
                    <div className="h-8 w-64 mx-auto bg-muted rounded-full mb-6" />
                    <div className="h-16 w-96 mx-auto bg-muted rounded mb-6" />
                    <div className="h-6 w-80 mx-auto bg-muted rounded mb-8" />
                </div>
            </div>
        </main>
    );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="glass-card p-6 text-center card-hover">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
