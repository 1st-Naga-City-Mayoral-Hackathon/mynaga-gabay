'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
    MessageCircle, 
    Building2, 
    Pill, 
    FileText, 
    ArrowRight, 
    Megaphone, 
    Rocket, 
    Info, 
    Mic, 
    Scan, 
    Bot
} from 'lucide-react';

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

function Dashboard({ session }: { session: Session }) {
    const { t } = useLanguage();
    const user = session.user;

    const quickActions = [
        {
            href: '/chat',
            title: t('nav.chat'),
            desc: t('chat.description'),
            icon: <MessageCircle className="w-6 h-6" />,
            className: 'bg-gabay-orange-500/10 text-gabay-orange-600 dark:text-gabay-orange-500',
        },
        {
            href: '/facilities',
            title: t('nav.facilities'),
            desc: t('feature.facilities.desc'),
            icon: <Building2 className="w-6 h-6" />,
            className: 'bg-gabay-blue/10 text-gabay-blue',
        },
        {
            href: '/medications',
            title: t('nav.medications'),
            desc: t('feature.medications.desc'),
            icon: <Pill className="w-6 h-6" />,
            className: 'bg-gabay-purple/10 text-gabay-purple',
        },
        {
            href: '/philhealth',
            title: t('nav.philhealth'),
            desc: t('feature.philhealth.desc'),
            icon: <FileText className="w-6 h-6" />,
            className: 'bg-gabay-teal/10 text-gabay-teal',
        },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Welcome Section */}
                <section className="mb-12">
                    <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-gabay-orange-500 to-red-600 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {t('auth.welcome')}, {user?.name}! 👋
                            </h1>
                            <p className="text-gabay-orange-100 text-lg max-w-xl">
                                {t('dashboard.subtitle')}
                            </p>
                            <Link
                                href="/chat"
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-gabay-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg shadow-black/10"
                            >
                                <span>{t('dashboard.startChat')}</span>
                                <ArrowRight className="w-5 h-5" />
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
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-md transition-all ${action.className}`}>
                                {action.icon}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{action.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {action.desc}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity & Updates */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Chats */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">{t('chat.recentChats')}</h2>
                            <Link href="/chat" className="text-sm text-gabay-orange-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gabay-orange-500/10 text-gabay-orange-600 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Common flu symptoms</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gabay-orange-500/10 text-gabay-orange-600 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Nearest pharmacy</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Health Updates */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">{t('dashboard.healthInfo')}</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gabay-blue/10 border border-gabay-blue/20">
                                <div className="flex items-start gap-3">
                                    <span className="text-gabay-blue mt-1">
                                        <Megaphone className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-bold text-gabay-blue">{t('dashboard.healthOffice')}</h3>
                                        <p className="text-xs text-gabay-blue/80 mt-1">
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gabay-orange-500/10 text-gabay-orange-600 text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-gabay-orange-500 animate-pulse" />
                        {t('landing.badge')}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        {t('landing.hero.title')}{' '}
                        {/* CHANGED: Individual letters with specific, contrast-accessible colors */}
                        <span>
                            {/* Navy Blue (using text-blue-900 for contrast) */}
                            <span className="text-blue-900 dark:text-blue-400">N</span>
                            {/* Teal (using standard accessible teal shade) */}
                            <span className="text-teal-600 dark:text-teal-400">a</span>
                            {/* Red (using standard accessible red shade) */}
                            <span className="text-red-600 dark:text-red-400">g</span>
                            {/* Yellow (using text-yellow-600/amber for accessibilty on white background) */}
                            <span className="text-yellow-600 dark:text-yellow-400">a</span>
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        {t('landing.hero.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login" className="glass-button text-lg px-8 py-4 flex items-center justify-center gap-2">
                            <Rocket className="w-6 h-6" /> 
                            {t('landing.hero.signin')}
                        </Link>
                        <Link href="/about" className="glass-button-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                            <Info className="w-6 h-6" />
                            {t('nav.about')}
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
                            icon={<Building2 className="w-8 h-8" />}
                            title={t('feature.facilities.title')}
                            description={t('feature.facilities.desc')}
                            colorClass="bg-gabay-blue/10 text-gabay-blue"
                        />
                        <FeatureCard
                            icon={<Pill className="w-8 h-8" />}
                            title={t('feature.medications.title')}
                            description={t('feature.medications.desc')}
                            colorClass="bg-gabay-purple/10 text-gabay-purple"
                        />
                        <FeatureCard
                            icon={<FileText className="w-8 h-8" />}
                            title={t('feature.philhealth.title')}
                            description={t('feature.philhealth.desc')}
                            colorClass="bg-gabay-teal/10 text-gabay-teal"
                        />
                        <FeatureCard
                            icon={<Mic className="w-8 h-8" />}
                            title={t('feature.voice.title')}
                            description={t('feature.voice.desc')}
                            colorClass="bg-gabay-orange-500/10 text-gabay-orange-600"
                        />
                        <FeatureCard
                            icon={<Scan className="w-8 h-8" />}
                            title={t('feature.scanner.title')}
                            description={t('feature.scanner.desc')}
                            colorClass="bg-gabay-blue/10 text-gabay-blue"
                        />
                        <FeatureCard
                            icon={<Bot className="w-8 h-8" />}
                            title={t('feature.ai.title')}
                            description={t('feature.ai.desc')}
                            colorClass="bg-gabay-orange-500/10 text-gabay-orange-600"
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
                                <div className="text-2xl font-bold text-gabay-orange-600">6+</div>
                                {t('landing.stats.facilities')}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gabay-orange-600">3</div>
                                {t('landing.stats.languages')}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gabay-orange-600">24/7</div>
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

function FeatureCard({ 
    icon, 
    title, 
    description, 
    colorClass = "bg-primary/10 text-primary" 
}: { 
    icon: React.ReactNode; 
    title: string; 
    description: string;
    colorClass?: string;
}) {
    return (
        <div className="glass-card p-6 text-center card-hover">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorClass}`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}