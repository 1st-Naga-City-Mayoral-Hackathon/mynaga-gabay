import type { HealthFacility } from '@mynaga/shared';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
} from 'lucide-react';

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
  government_office: 'Government Office',
};

export function FacilityCard({ facility }: FacilityCardProps) {
    const typeColor =
      typeColors[facility.type as keyof typeof typeColors] ||
      typeColors.clinic;
  
    const typeLabel =
      typeLabels[facility.type as keyof typeof typeLabels] ||
      facility.type;
  
    return (
      // 1. ADDED: flex flex-col h-full
      // This ensures the card stretches to fill the grid height and organizes children vertically
      <div className="glass-card p-4 hover:shadow-lg transition-shadow flex flex-col h-full">
        {/* Header */}
        <div className="mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            {facility.name}
          </h3>
  
          {/* Type below name */}
          <span className={`mt-1 inline-block text-xs px-2 py-1 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
        </div>
  
        {/* Address */}
        <p className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300 mb-3">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{facility.address}</span>
        </p>
  
        {/* Hours */}
        {facility.hours && (
          <p className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{facility.hours}</span>
          </p>
        )}
  
        {/* Services */}
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
  
        {/* Actions */}
        {/* 2. ADDED: mt-auto pt-4 */}
        {/* mt-auto pushes this div to the very bottom. pt-4 gives it a little breathing room from the content above. */}
        <div className="flex gap-2 mt-auto pt-4">
          {facility.phone && (
            <a
              href={`tel:${facility.phone}`}
              className="flex flex-1 items-center justify-center gap-1.5 py-2 bg-gabay-teal/10 text-gabay-teal rounded-lg text-sm font-medium hover:bg-gabay-teal/20 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
  
          <button className="flex flex-1 items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <Navigation className="h-4 w-4" />
            Directions
          </button>
        </div>
      </div>
    );
}