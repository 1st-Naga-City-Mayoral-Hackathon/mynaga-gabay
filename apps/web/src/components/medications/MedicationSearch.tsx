'use client';

import { useState } from 'react';

interface MedicationSearchProps {
    onSearch: (query: string) => void;
}

const suggestions = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Salbutamol',
    'Metformin',
];

export function MedicationSearch({ onSearch }: MedicationSearchProps) {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleChange = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="glass-card p-4 mb-4">
            <div className="relative">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    <input
                        type="text"
                        placeholder="Search medications..."
                        value={query}
                        onChange={(e) => handleChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gabay-teal/50 placeholder:text-slate-400"
                    />
                </div>

                {showSuggestions && !query && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                        <p className="px-4 py-2 text-xs text-slate-500 uppercase">
                            Popular Searches
                        </p>
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleChange(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                💊 {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
