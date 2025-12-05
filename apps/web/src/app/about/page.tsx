import Link from 'next/link';
import { Header } from '@/components/Header';

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {/* Hero */}
                <section className="text-center py-8">
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
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">🎯 Our Mission</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        We believe that everyone deserves access to health information in their own language.
                        MyNaga Gabay (My Naga Guide) bridges the gap between healthcare information and
                        Bikolano communities by providing a voice-first, AI-powered assistant that understands
                        and responds in Bikol.
                    </p>
                </section>

                {/* Problem & Solution */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                            ❌ The Problem
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <li>• Most health apps are English-only</li>
                            <li>• Elderly struggle with text-based interfaces</li>
                            <li>• Limited awareness of local health resources</li>
                            <li>• Confusing PhilHealth processes</li>
                            <li>• Difficulty understanding prescriptions</li>
                        </ul>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                            ✅ Our Solution
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <li>• Voice-first in Bikol, Filipino, English</li>
                            <li>• Simple, accessible interface</li>
                            <li>• Naga City-specific health facilities</li>
                            <li>• Step-by-step PhilHealth guidance</li>
                            <li>• Prescription scanning & explanation</li>
                        </ul>
                    </div>
                </div>

                {/* Team */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                        👥 Our Team
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { name: 'Meg', role: 'UX Research', emoji: '🎨' },
                            { name: 'Jeremiah', role: 'Web Dev', emoji: '💻' },
                            { name: 'Jacob', role: 'API + n8n', emoji: '⚙️' },
                            { name: 'Choi', role: 'Mobile Dev', emoji: '📱' },
                            { name: 'Sheane', role: 'AI Engineer', emoji: '🤖' },
                        ].map((member) => (
                            <div key={member.name} className="glass-card p-4 text-center">
                                <div className="text-2xl mb-2">{member.emoji}</div>
                                <div className="font-semibold text-slate-800 dark:text-white">{member.name}</div>
                                <div className="text-xs text-slate-500">{member.role}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack */}
                <section className="glass-card p-6 mb-8">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">🛠️ Built With</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Next.js', 'Flutter', 'Express', 'PostgreSQL', 'Claude AI', 'n8n', 'pgvector', 'Tailwind CSS'].map((tech) => (
                            <span key={tech} className="badge badge-primary">{tech}</span>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                        Ready to try Gabay?
                    </h2>
                    <Link href="/chat" className="glass-button inline-block">
                        🏥 Start Chatting Now
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
