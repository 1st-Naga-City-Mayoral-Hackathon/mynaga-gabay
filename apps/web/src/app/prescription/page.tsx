'use client';

import { PrescriptionScanner } from '@/components/prescription/PrescriptionScanner';
import { useLanguage } from '@/contexts/LanguageContext';

const translations = {
    en: {
        title: 'Prescription Scanner',
        subtitle: 'Take a photo of your prescription to get medication explanations',
        instructions: [
            'Take a clear photo of your prescription',
            'AI will identify the medications',
            'Get explanations in your language',
            'See PhilHealth coverage status'
        ]
    },
    fil: {
        title: 'Prescription Scanner',
        subtitle: 'Kunan ng litrato ang iyong reseta para makakuha ng paliwanag sa gamot',
        instructions: [
            'Kumuha ng malinaw na litrato ng iyong reseta',
            'Makikilala ng AI ang mga gamot',
            'Makakuha ng paliwanag sa iyong wika',
            'Tingnan ang PhilHealth coverage'
        ]
    },
    bcl: {
        title: 'Prescription Scanner',
        subtitle: 'Magkuha nin litrato kan saimong reseta para makakua nin paliwanag sa bulong',
        instructions: [
            'Magkuha nin malinaw na litrato kan saimong reseta',
            'Mamimidbid kan AI an mga bulong',
            'Makakua nin paliwanag sa saimong tataramon',
            'Hilingon an PhilHealth coverage'
        ]
    }
};

export default function PrescriptionPage() {
    const { language } = useLanguage();
    const t = translations[language as keyof typeof translations] || translations.fil;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gabay-teal/10 mb-4">
                        <span className="text-3xl">💊</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        {t.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        {t.subtitle}
                    </p>
                </div>

                {/* Instructions */}
                <div className="glass-card p-4 mb-6">
                    <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <span>📋</span>
                        <span>How it works</span>
                    </h2>
                    <ul className="space-y-2">
                        {t.instructions.map((instruction, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gabay-teal/20 text-gabay-teal flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span>{instruction}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Scanner Component */}
                <PrescriptionScanner />

                {/* Privacy Notice */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                        <span>🔒</span>
                        <span>Your prescription photos are processed securely and never stored.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
