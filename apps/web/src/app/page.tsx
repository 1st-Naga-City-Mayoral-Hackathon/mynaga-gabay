'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';

export default function LandingPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero Section */}
                <section className="text-center py-12 md:py-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gabay-teal/10 text-gabay-teal text-sm font-medium mb-6">
                        <span className="w-2 h-2 rounded-full bg-gabay-teal animate-pulse" />
                        Now available for Naga City residents
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6">
                        Your Health Assistant in{' '}
                        <span className="gradient-text">Bikol</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                        Get health information, find nearby facilities, and understand your medications —
                        all in Bikol, Filipino, or English.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/chat"
                            className="glass-button text-lg px-8 py-4"
                        >
                            🏥 Start Chat with Gabay
                        </Link>
                        <Link
                            href="/login"
                            className="glass-button-secondary text-lg px-8 py-4"
                        >
                            Sign In / Sign Up
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-12">
                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">
                        What Gabay Can Help You With
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon="🏥"
                            title="Find Health Facilities"
                            description="Locate hospitals, clinics, and barangay health centers in Naga City with contact info and directions."
                        />
                        <FeatureCard
                            icon="💊"
                            title="Medication Info"
                            description="Learn about your medications, proper dosage, side effects, and drug interactions."
                        />
                        <FeatureCard
                            icon="📋"
                            title="PhilHealth Guide"
                            description="Check coverage, understand requirements, and learn how to avail your benefits."
                        />
                        <FeatureCard
                            icon="🗣️"
                            title="Voice-First"
                            description="Speak naturally in Bikol, Filipino, or English. Perfect for elderly and those who prefer speaking."
                        />
                        <FeatureCard
                            icon="📸"
                            title="Prescription Scanner"
                            description="Take a photo of your prescription to understand what each medication is for."
                        />
                        <FeatureCard
                            icon="🤖"
                            title="AI-Powered"
                            description="Powered by advanced AI to give you accurate, helpful health information 24/7."
                        />
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-12 text-center">
                    <div className="glass-card p-8 max-w-3xl mx-auto">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                            Built for Naga City
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Developed for the 1st Naga City Mayoral Hackathon to serve our Bikolano community
                            with accessible health information in our native language.
                        </p>
                        <div className="flex justify-center gap-8 text-sm text-slate-500">
                            <div>
                                <div className="text-2xl font-bold text-gabay-teal">6+</div>
                                Health Facilities
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gabay-teal">3</div>
                                Languages
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gabay-teal">24/7</div>
                                Available
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    <p>© 2024 MyNaga Gabay | 1st Naga City Mayoral Hackathon</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <Link href="/about" className="hover:text-gabay-teal">About</Link>
                        <Link href="/login" className="hover:text-gabay-teal">Login</Link>
                        <Link href="/chat" className="hover:text-gabay-teal">Chat</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="glass-card p-6 text-center card-hover">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
    );
}
