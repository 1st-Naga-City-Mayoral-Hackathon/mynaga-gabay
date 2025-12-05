'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { Header } from '@/components/Header';
import { LanguageSelector } from '@/components/LanguageSelector';
import { QuickActions } from '@/components/QuickActions';
import { PrescriptionScanner } from '@/components/prescription/PrescriptionScanner';
import { LANGUAGE_GREETINGS, type SupportedLanguage } from '@mynaga/shared';

export default function Home() {
    const [language, setLanguage] = useState<SupportedLanguage>('fil');
    const [showScanner, setShowScanner] = useState(false);

    return (
        <main className="min-h-screen flex flex-col pb-20">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
                {/* Language Selector */}
                <div className="mb-4 flex justify-center">
                    <LanguageSelector
                        value={language}
                        onChange={setLanguage}
                    />
                </div>

                {/* Welcome Message */}
                <div className="glass-card p-4 mb-4 text-center">
                    <div className="text-3xl mb-2">🏥</div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">
                        Gabay
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {LANGUAGE_GREETINGS[language]}
                    </p>
                </div>

                {/* Quick Actions */}
                <QuickActions />

                {/* Prescription Scanner Toggle */}
                <button
                    onClick={() => setShowScanner(!showScanner)}
                    className="w-full mb-4 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    📸 {showScanner ? 'Hide Scanner' : 'Scan Prescription'}
                </button>

                {/* Prescription Scanner */}
                {showScanner && (
                    <div className="mb-4">
                        <PrescriptionScanner />
                    </div>
                )}

                {/* Chat Interface */}
                <ChatInterface language={language} />
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 pb-20">
                <p>MyNaga Gabay © 2024 | Naga City Mayoral Hackathon</p>
            </footer>
        </main>
    );
}
