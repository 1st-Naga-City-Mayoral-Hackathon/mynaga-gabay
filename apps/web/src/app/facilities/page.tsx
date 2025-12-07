'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import facilitiesData from '@/data/facilities.json';

export default function FacilitiesPage() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    const facilities = facilitiesData.facilities;

    // Filter Logic
    const filteredFacilities = facilities.filter((facility) => {
        const matchesSearch =
            facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (facility.services || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = selectedType === 'all' || facility.type === selectedType;

        return matchesSearch && matchesType;
    });

    const facilityTypes = [
        { id: 'all', label: t('facilities.filter.all') },
        { id: 'hospital', label: t('facilities.filter.hospital') },
        { id: 'health_center', label: t('facilities.filter.center') },
        { id: 'pharmacy', label: t('facilities.filter.pharmacy') },
        { id: 'clinic', label: t('facilities.filter.clinic') },
        { id: 'laboratory', label: t('facilities.filter.lab') },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {t('facilities.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('facilities.subtitle')}
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder={t('facilities.search')}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2">
                        {facilityTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedType === type.id
                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Facilities Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFacilities.map((facility) => (
                        <div
                            key={facility.id}
                            className="glass-card flex flex-col h-full hover:scale-[1.02] transition-transform duration-200"
                        >
                            <div className="p-6 flex-1">
                                {/* Type Badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${facility.type === 'hospital' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                        facility.type === 'health_center' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                            'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                        }`}>
                                        {facility.type === 'health_center' ? t('facilities.filter.center') :
                                            facility.type === 'hospital' ? t('facilities.filter.hospital') :
                                                facility.type}
                                    </span>
                                    {facility.philhealthAccredited && (
                                        <span title={t('facilities.card.accredited')} className="text-lg">✅</span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                                    {facility.name}
                                </h3>

                                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-start gap-2">
                                        <span>📍</span>
                                        <span className="line-clamp-2">{facility.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>📞</span>
                                        <span>{facility.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🕒</span>
                                        <span>{facility.hours}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                                        {t('facilities.card.services')}
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(facility.services || []).slice(0, 4).map((service, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                        {(facility.services || []).length > 4 && (
                                            <span className="px-2 py-1 text-xs text-muted-foreground">
                                                +{(facility.services || []).length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredFacilities.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-foreground">No facilities found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
