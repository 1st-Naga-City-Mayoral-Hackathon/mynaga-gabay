'use client';

import { useState } from 'react';
import { FacilityCard } from '@/components/facilities/FacilityCard';
import { FacilityFilter } from '@/components/facilities/FacilityFilter';
import type { HealthFacility } from '@mynaga/shared';

// Sample data - will be replaced with API call
const sampleFacilities: HealthFacility[] = [
    {
        id: '1',
        name: 'Bicol Medical Center',
        type: 'hospital',
        address: 'Concepcion Grande, Naga City',
        barangay: 'Concepcion Grande',
        city: 'Naga City',
        phone: '(054) 472-3456',
        hours: '24/7',
        services: ['Emergency', 'Surgery', 'OB-Gyne', 'Pediatrics', 'Internal Medicine'],
    },
    {
        id: '2',
        name: 'Naga City Hospital',
        type: 'hospital',
        address: 'Peñafrancia Ave, Naga City',
        barangay: 'Centro',
        city: 'Naga City',
        phone: '(054) 811-1234',
        hours: '24/7',
        services: ['Emergency', 'General Medicine', 'Pediatrics'],
    },
    {
        id: '3',
        name: 'Mother Seton Hospital',
        type: 'hospital',
        address: 'Panganiban Drive, Naga City',
        barangay: 'Centro',
        city: 'Naga City',
        phone: '(054) 473-1111',
        hours: '24/7',
        services: ['Emergency', 'Surgery', 'OB-Gyne'],
    },
    {
        id: '4',
        name: 'City Health Office',
        type: 'health_center',
        address: 'City Hall Complex, J. Miranda Ave',
        barangay: 'Centro',
        city: 'Naga City',
        phone: '(054) 473-8000',
        hours: '8:00 AM - 5:00 PM',
        services: ['Immunization', 'Prenatal', 'Family Planning', 'TB DOTS'],
    },
    {
        id: '5',
        name: 'Barangay Health Center - Triangulo',
        type: 'health_center',
        address: 'Triangulo, Naga City',
        barangay: 'Triangulo',
        city: 'Naga City',
        hours: '8:00 AM - 5:00 PM',
        services: ['Basic Consultation', 'BP Monitoring', 'First Aid'],
    },
    {
        id: '6',
        name: 'Mercury Drug - SM Naga',
        type: 'pharmacy',
        address: 'SM City Naga, CBD II',
        barangay: 'Triangulo',
        city: 'Naga City',
        hours: '10:00 AM - 9:00 PM',
        services: ['Prescription', 'OTC Medicines', 'Health Products'],
    },
];

export default function FacilitiesPage() {
    const [filters, setFilters] = useState({ type: '', search: '' });

    const filteredFacilities = sampleFacilities.filter((facility) => {
        const matchesType = !filters.type || facility.type === filters.type;
        const matchesSearch = !filters.search ||
            facility.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            facility.barangay?.toLowerCase().includes(filters.search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <main className="min-h-screen pb-24">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        🏥 Health Facilities
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Find hospitals, clinics, and health centers in Naga City
                    </p>
                </div>

                <FacilityFilter onFilterChange={setFilters} />

                <div className="grid gap-4 md:grid-cols-2">
                    {filteredFacilities.map((facility) => (
                        <FacilityCard key={facility.id} facility={facility} />
                    ))}
                </div>

                {filteredFacilities.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No facilities found matching your filters.
                    </div>
                )}
            </div>
        </main>
    );
}
