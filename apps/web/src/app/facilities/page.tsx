'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import facilitiesData from '@/data/facilities.json';
import { FacilityCard } from '@/components/facilities/FacilityCard'; 
import { Search } from 'lucide-react'; 

// 1. IMPORT THE TYPE FROM YOUR SHARED LIB
import type { HealthFacility } from '@mynaga/shared';

export default function FacilitiesPage() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    // 2. THE FIX: TYPE ASSERTION
    // We tell TypeScript: "Trust me, this JSON data matches the HealthFacility[] shape."
    // This fixes the 'string is not assignable to FacilityType' error.
    const facilities = facilitiesData.facilities as unknown as HealthFacility[];

    // Filter Logic
    const filteredFacilities = facilities.filter((facility) => {
        const matchesSearch =
            facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (facility.services || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = selectedType === 'all' || facility.type === selectedType;

        return matchesSearch && matchesType;
    });

    // ... (Rest of your component remains the same)

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {t('facilities.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('facilities.subtitle')}
                    </p>
                </div>

                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('facilities.search')}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFacilities.map((facility) => (
                        <FacilityCard key={facility.id} facility={facility} />
                    ))}
                </div>

                {filteredFacilities.length === 0 && (
                    <div className="text-center py-20">
                        <div className="flex justify-center mb-4 text-slate-300">
                            <Search className="h-12 w-12" />
                        </div>
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