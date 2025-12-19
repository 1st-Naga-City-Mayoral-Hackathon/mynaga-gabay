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
    // CHANGE: Added `gap-4` to handle vertical spacing evenly
    // CHANGE: Increased padding to `p-5` for better breathing room
    <div className="glass-card p-5 hover:shadow-lg transition-shadow flex flex-col h-full gap-4">
      
      {/* Header Section */}
      <div>
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white leading-tight">
          {facility.name}
        </h3>
        <span className={`mt-2 inline-block text-xs px-2.5 py-1 rounded-full font-medium ${typeColor}`}>
          {typeLabel}
        </span>
      </div>

      {/* Info Section: Grouped Address and Hours together */}
      <div className="space-y-2.5">
        <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
          <span className="leading-snug">{facility.address}</span>
        </p>

        {facility.hours && (
          <p className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
            <span className="leading-snug">{facility.hours}</span>
          </p>
        )}
      </div>

      {/* Services Section */}
      {facility.services && facility.services.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {facility.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600"
            >
              {service}
            </span>
          ))}
          {facility.services.length > 3 && (
            <span className="text-xs text-gabay-orange-400 flex items-center px-1">
              +{facility.services.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions Section */}
      {/* mt-auto pushes this to the bottom, pt-2 adds a little extra divider space */}
      <div className="flex gap-3 mt-auto pt-2">
        {facility.phone && (
          <a
            href={`tel:${facility.phone}`}
            className="flex flex-1 items-center justify-center gap-2 py-2.5 bg-gabay-orange-100/50 text-gabay-orange rounded-lg text-sm font-medium hover:bg-gabay-orange/20 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        )}
        

        <button className="flex flex-1 items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <Navigation className="h-4 w-4" />
          Directions
        </button>
      </div>
    </div>
  );
}