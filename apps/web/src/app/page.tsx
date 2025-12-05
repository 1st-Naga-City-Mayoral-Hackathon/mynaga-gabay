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
        <main className="min-h-screen flex flex-col pb-24">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-4 max-w-lg">
                {/* Welcome Hero */}
                <div className="relative glass-card p-6 mb-6 text-center overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gabay-teal/20 to-transparent rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl" />

                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gabay-teal to-teal-500 shadow-lg shadow-gabay-teal/25 mb-4">
                            <span className="text-3xl">🏥</span>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                            <span className="gradient-text">Gabay</span>
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                            {LANGUAGE_GREETINGS[language]}
                        </p>

                        {/* Language Selector */}
                        <LanguageSelector value={language} onChange={setLanguage} />
                    </div>
                </div>

                {/* Quick Actions */}
                <QuickActions />

                {/* Prescription Scanner Toggle */}
                <button
                    onClick={() => setShowScanner(!showScanner)}
                    className={`
            w-full mb-4 py-3.5 rounded-xl font-semibold
            flex items-center justify-center gap-2
            transition-all duration-200
            ${showScanner
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30'
                        }
          `}
                >
                    <span className="text-lg">{showScanner ? '✕' : '📸'}</span>
                    {showScanner ? 'Close Scanner' : 'Scan Prescription'}
                </button>

                {/* Prescription Scanner */}
                {showScanner && (
                    <div className="mb-4 animate-in slide-in-from-top duration-300">
                        <PrescriptionScanner />
                    </div>
                )}

                {/* Chat Section */}
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                        Chat with Gabay
                    </h3>
                    <ChatInterface language={language} />
                </div>
            </div>
        </main>
    );
}
