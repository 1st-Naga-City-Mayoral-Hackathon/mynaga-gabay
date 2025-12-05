'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <LandingPageSkeleton />;
    }

    return <LandingPageContent />;
}

function LandingPageContent() {
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
                        <Link href="/chat" className="glass-button text-lg px-8 py-4">
                            🏥 {t('landing.hero.cta')}
                        </Link>
                        <Link href="/login" className="glass-button-secondary text-lg px-8 py-4">
                            {t('landing.hero.signin')}
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
                        <Link href="/chat" className="hover:text-primary">{t('nav.chat')}</Link>
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
