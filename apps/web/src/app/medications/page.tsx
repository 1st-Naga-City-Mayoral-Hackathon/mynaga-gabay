'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import medicationsData from '@/data/medications.json';

export default function MedicationsPage() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const medications = medicationsData.medicines;
    const filteredMedications = medications.filter(med => {
        const term = searchTerm.toLowerCase();
        return (
            med.genericName.toLowerCase().includes(term) ||
            med.brandNames.some(b => b.toLowerCase().includes(term)) ||
            (med.commonUses || []).some(u => u.toLowerCase().includes(term)) ||
            (med.bikolName || '').toLowerCase().includes(term)
        );
    });

    return (
        <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {t('medications.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('medications.subtitle')}
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder={t('medications.search')}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Medications Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMedications.map((med) => (
                        <div
                            key={med.id}
                            className="glass-card flex flex-col h-full hover:scale-[1.02] transition-transform duration-200"
                        >
                            {/* Card Header: Generic & Brand Names */}
                            <div className="p-6 flex-1">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-foreground mb-1">
                                        {med.genericName}
                                    </h3>
                                    <div className="flex flex-wrap gap-1">
                                        {med.brandNames.map((brand, idx) => (
                                            <span
                                                key={idx}
                                                className="text-sm font-medium text-teal-600 dark:text-teal-400"
                                            >
                                                {brand}{idx < med.brandNames.length - 1 ? ',' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Bikol Translation */}
                                {med.bikolName && (
                                    <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-100 dark:border-teal-800">
                                        <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wide mb-1">
                                            {t('medications.card.bikol')}
                                        </div>
                                        <p className="text-sm text-teal-800 dark:text-teal-200 italic">
                                            "{med.bikolName}"
                                        </p>
                                    </div>
                                )}

                                {/* Common Uses */}
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        {t('medications.card.uses')}
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(med.commonUses || []).map((use, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300"
                                            >
                                                {use}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Warnings (if any) */}
                                {(med.warnings || []).length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                                            ⚠️ {t('medications.card.warnings')}
                                        </h4>
                                        <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc list-inside space-y-1">
                                            {med.warnings.slice(0, 2).map((warning, idx) => (
                                                <li key={idx}>{warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredMedications.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">💊</div>
                        <h3 className="text-lg font-medium text-foreground">No medications found</h3>
                        <p className="text-muted-foreground">
                            Try searching for a different generic or brand name
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
