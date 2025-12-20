'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { 
    Target, 
    XCircle, 
    CheckCircle2, 
    Users, 
    Palette, 
    Code2, 
    Settings, 
    Smartphone, 
    Bot, 
    Wrench,
    Hospital,
    HeartPulse
} from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {/* Hero */}
                <section className="text-center py-8">
                    <div className="flex justify-center mb-4">
                        <HeartPulse className="w-12 h-12 text-gabay-orange-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                        About <span className="gradient-text">MyNaga Gabay</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        A voice-enabled health assistant designed specifically for Naga City residents,
                        supporting Bikol, Filipino, and English.
                    </p>
                </section>

                {/* Mission */}
                <section className="glass-card p-8 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-gabay-orange-600" />
                        Our Mission
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        We believe that everyone deserves access to health information in their own language.
                        MyNaga Gabay (My Naga Guide) bridges the gap between healthcare information and
                        Bikolano communities by providing a voice-first, AI-powered assistant that understands
                        and responds in Bikol.
                    </p>
                </section>

                {/* Problem & Solution */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="glass-card p-6 border-l-4 border-red-500">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            The Problem
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <li className="flex gap-2"><span>•</span> Most health apps are English-only</li>
                            <li className="flex gap-2"><span>•</span> Elderly struggle with text-based interfaces</li>
                            <li className="flex gap-2"><span>•</span> Limited awareness of local health resources</li>
                            <li className="flex gap-2"><span>•</span> Confusing PhilHealth processes</li>
                            <li className="flex gap-2"><span>•</span> Difficulty understanding prescriptions</li>
                        </ul>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Our Solution
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <li className="flex gap-2"><span>•</span> Voice-first in Bikol, Filipino, English</li>
                            <li className="flex gap-2"><span>•</span> Simple, accessible interface</li>
                            <li className="flex gap-2"><span>•</span> Naga City-specific health facilities</li>
                            <li className="flex gap-2"><span>•</span> Step-by-step PhilHealth guidance</li>
                            <li className="flex gap-2"><span>•</span> Prescription scanning & explanation</li>
                        </ul>
                    </div>
                </div>

                {/* Team */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
                        <Users className="w-6 h-6 text-gabay-orange-600" />
                        Our Team
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { name: 'Meg', role: 'UX Engineer', icon: <Palette className="w-6 h-6" /> },
                            { name: 'Jeremiah', role: 'Web Developer', icon: <Code2 className="w-6 h-6" /> },
                            { name: 'Jacob', role: 'API + n8n', icon: <Settings className="w-6 h-6" /> },
                            { name: 'Choi', role: 'Mobile Dev', icon: <Smartphone className="w-6 h-6" /> },
                            { name: 'Sheane', role: 'AI Engineer', icon: <Bot className="w-6 h-6" /> },
                        ].map((member) => (
                            <div key={member.name} className="glass-card p-4 text-center hover:scale-105 transition-transform">
                                <div className="flex justify-center text-gabay-orange-600 mb-2">
                                    {member.icon}
                                </div>
                                <div className="font-semibold text-slate-800 dark:text-white">{member.name}</div>
                                <div className="text-xs text-slate-500">{member.role}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack */}
                <section className="glass-card p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-gabay-orange-600" />
                        Built With
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {['Next.js', 'Flutter', 'Express', 'PostgreSQL', 'Claude AI', 'n8n', 'pgvector', 'Tailwind CSS'].map((tech) => (
                            <span key={tech} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                {tech}
                            </span>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                        Ready to try Gabay?
                    </h2>
                    <Link href="/chat" className="inline-flex items-center gap-2 bg-gabay-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gabay-orange-700 transition-colors shadow-lg">
                        <Hospital className="w-5 h-5" />
                        Start Chatting Now
                    </Link>
                </section>
            </div>

            {/* Footer */}
            <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                <p>© 2024 MyNaga Gabay | 1st Naga City Mayoral Hackathon</p>
            </footer>
        </main>
    );
}