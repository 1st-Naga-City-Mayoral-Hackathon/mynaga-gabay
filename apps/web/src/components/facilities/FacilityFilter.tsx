'use client';

import { useState } from 'react';

interface FacilityFilterProps {
    onFilterChange: (filters: { type: string; search: string }) => void;
}

const facilityTypes = [
    { value: '', label: 'All Types' },
    { value: 'hospital', label: 'Hospitals' },
    { value: 'health_center', label: 'Health Centers' },
    { value: 'clinic', label: 'Clinics' },
    { value: 'pharmacy', label: 'Pharmacies' },
];

export function FacilityFilter({ onFilterChange }: FacilityFilterProps) {
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');

    const handleTypeChange = (newType: string) => {
        setType(newType);
        onFilterChange({ type: newType, search });
    };

    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch);
        onFilterChange({ type, search: newSearch });
    };

    return (
        <div className="glass-card p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or barangay..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gabay-teal/50 placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {facilityTypes.map((ft) => (
                        <button
                            key={ft.value}
                            onClick={() => handleTypeChange(ft.value)}
                            className={`
                whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${type === ft.value
                                    ? 'bg-gabay-teal text-white'
                                    : 'bg-white/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-gabay-teal/10'
                                }
              `}
                        >
                            {ft.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
