'use client';

import { useState } from 'react';
import { MedicationCard } from '@/components/medications/MedicationCard';
import { MedicationSearch } from '@/components/medications/MedicationSearch';

const sampleMedications = [
    {
        id: 'med-001',
        genericName: 'Paracetamol',
        brandNames: ['Biogesic', 'Calpol', 'Tempra'],
        category: 'Analgesic',
        description: 'Pain reliever and fever reducer',
        dosageForms: ['Tablet', 'Syrup', 'Drops'],
        commonUses: ['Fever', 'Headache', 'Body pain', 'Toothache'],
        warnings: ['Do not exceed 4g daily', 'Avoid with alcohol', 'Check liver function if prolonged use'],
    },
    {
        id: 'med-002',
        genericName: 'Ibuprofen',
        brandNames: ['Advil', 'Medicol', 'Midol'],
        category: 'NSAID',
        description: 'Anti-inflammatory pain reliever',
        dosageForms: ['Tablet', 'Capsule', 'Syrup'],
        commonUses: ['Muscle pain', 'Menstrual cramps', 'Arthritis'],
        warnings: ['Take with food', 'Not for kidney disease', 'May cause stomach upset'],
    },
    {
        id: 'med-003',
        genericName: 'Amoxicillin',
        brandNames: ['Amoxil', 'Himox', 'Moxillin'],
        category: 'Antibiotic',
        description: 'Broad-spectrum antibiotic for bacterial infections',
        dosageForms: ['Capsule', 'Suspension'],
        commonUses: ['Respiratory infections', 'Ear infections', 'UTI'],
        warnings: ['Complete full course', 'May cause allergic reaction', 'Not for viral infections'],
    },
    {
        id: 'med-004',
        genericName: 'Salbutamol',
        brandNames: ['Ventolin', 'Asmol'],
        category: 'Bronchodilator',
        description: 'Opens airways for easier breathing',
        dosageForms: ['Inhaler', 'Nebule', 'Tablet'],
        commonUses: ['Asthma', 'Bronchitis', 'COPD'],
        warnings: ['May cause tremors', 'Follow prescribed dosage'],
    },
    {
        id: 'med-005',
        genericName: 'Metformin',
        brandNames: ['Glucophage', 'Diabex'],
        category: 'Antidiabetic',
        description: 'Controls blood sugar in Type 2 diabetes',
        dosageForms: ['Tablet'],
        commonUses: ['Type 2 Diabetes'],
        warnings: ['Take with meals', 'Check kidney function', 'Avoid alcohol'],
    },
];

export default function MedicationsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMedications = sampleMedications.filter((med) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            med.genericName.toLowerCase().includes(query) ||
            med.brandNames.some((b) => b.toLowerCase().includes(query)) ||
            med.commonUses.some((u) => u.toLowerCase().includes(query))
        );
    });

    return (
        <main className="min-h-screen pb-24">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        💊 Medications
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Search and learn about common medications
                    </p>
                </div>

                <MedicationSearch onSearch={setSearchQuery} />

                <div className="grid gap-4 md:grid-cols-2">
                    {filteredMedications.map((medication) => (
                        <MedicationCard key={medication.id} medication={medication} />
                    ))}
                </div>

                {filteredMedications.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500 mb-4">No medications found.</p>
                        <p className="text-sm text-slate-400">
                            Try searching by generic name, brand name, or symptom.
                        </p>
                    </div>
                )}

                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ <strong>Disclaimer:</strong> This information is for educational purposes only.
                        Always consult a healthcare professional before taking any medication.
                    </p>
                </div>
            </div>
        </main>
    );
}
