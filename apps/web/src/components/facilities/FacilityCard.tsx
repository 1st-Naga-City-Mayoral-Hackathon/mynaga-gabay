import type { HealthFacility } from '@mynaga/shared';

interface FacilityCardProps {
    facility: HealthFacility;
}

const typeColors = {
    hospital: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    health_center: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    clinic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    pharmacy: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    government_office: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

const typeLabels = {
    hospital: 'Hospital',
    health_center: 'Health Center',
    clinic: 'Clinic',
    pharmacy: 'Pharmacy',
    government_office: 'Gov Office',
};

export function FacilityCard({ facility }: FacilityCardProps) {
    const typeColor = typeColors[facility.type as keyof typeof typeColors] || typeColors.clinic;
    const typeLabel = typeLabels[facility.type as keyof typeof typeLabels] || facility.type;

    return (
        <div className="glass-card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                    {facility.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${typeColor}`}>
                    {typeLabel}
                </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                📍 {facility.address}
            </p>

            {facility.hours && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    🕐 {facility.hours}
                </p>
            )}

            {facility.services && facility.services.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {facility.services.slice(0, 3).map((service) => (
                        <span
                            key={service}
                            className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded"
                        >
                            {service}
                        </span>
                    ))}
                    {facility.services.length > 3 && (
                        <span className="text-xs text-slate-500">
                            +{facility.services.length - 3} more
                        </span>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                {facility.phone && (
                    <a
                        href={`tel:${facility.phone}`}
                        className="flex-1 text-center py-2 bg-gabay-teal/10 text-gabay-teal rounded-lg text-sm font-medium hover:bg-gabay-teal/20 transition-colors"
                    >
                        📞 Call
                    </a>
                )}
                <button className="flex-1 text-center py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    📍 Directions
                </button>
            </div>
        </div>
    );
}
