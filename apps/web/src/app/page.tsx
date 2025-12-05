'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { Header } from '@/components/Header';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LANGUAGE_GREETINGS, type SupportedLanguage } from '@mynaga/shared';

export default function Home() {
    const [language, setLanguage] = useState<SupportedLanguage>('fil');

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
                {/* Language Selector */}
                <div className="mb-6 flex justify-center">
                    <LanguageSelector
                        value={language}
                        onChange={setLanguage}
                    />
                </div>

                {/* Welcome Message */}
                <div className="glass-card p-6 mb-6 text-center">
                    <div className="text-4xl mb-4">🏥</div>
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
                        Gabay
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        {LANGUAGE_GREETINGS[language]}
                    </p>
                </div>

                {/* Chat Interface */}
                <ChatInterface language={language} />
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>MyNaga Gabay © 2024 | Naga City Mayoral Hackathon</p>
            </footer>
        </main>
    );
}
