'use client';

import type { FacilityCard } from '@mynaga/shared';
import { Building2, MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FacilityCardUIProps {
  card: FacilityCard;
  onGetDirections?: (facility: FacilityCard) => void;
}

function formatDistance(meters?: number): string {
  if (!meters) return '';
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  return `${(meters / 1000).toFixed(1)}km away`;
}

function getFacilityTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    hospital: 'Hospital',
    health_center: 'Health Center',
    clinic: 'Clinic',
    pharmacy: 'Pharmacy',
    birthing_home: 'Birthing Home',
    diagnostic_center: 'Diagnostic Center',
  };
  return labels[type || ''] || 'Health Facility';
}

function getFacilityTypeColor(type?: string): string {
  const colors: Record<string, string> = {
    hospital: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    health_center:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    clinic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    pharmacy:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    birthing_home:
      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    diagnostic_center:
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  };
  return (
    colors[type || ''] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
  );
}

export function FacilityCardUI({ card, onGetDirections }: FacilityCardUIProps) {
  const distanceText = formatDistance(card.distanceMeters);

  // Visual aid strategy:
  // 1) Use a real facility photo if provided in DB (`photoUrl`)
  // 2) Otherwise, show a lightweight OSM tile preview centered on the facility coordinates.
  const hasCoords = typeof card.lat === 'number' && typeof card.lng === 'number';
  const photoUrl = card.photoUrl || null;

  function getOsmTileUrl(lat: number, lng: number, zoom: number): { url: string; x: number; y: number } {
    const z = zoom;
    const n = 2 ** z;
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`, x, y };
  }

  const tile = hasCoords ? getOsmTileUrl(card.lat!, card.lng!, 16) : null;

  return (
    <div className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm my-3">
      {/* Visual aid: facility photo if available; otherwise show a static OSM map preview */}
      {(photoUrl || tile) && (
        <div className="mb-3 overflow-hidden rounded-lg border bg-gray-50 dark:bg-gray-900/20">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={`${card.name} photo`}
              className="w-full h-36 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="relative w-full h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile!.url}
                alt={`${card.name} map preview`}
                className="w-full h-36 object-cover"
                loading="lazy"
              />
              {/* Center marker */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-4 bg-red-500 rounded-full ring-2 ring-white shadow" />
              </div>
              <div className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white">
                OSM z16
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gabay-orange-500" />
          <h4 className="font-semibold text-sm">{card.name}</h4>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${getFacilityTypeColor(card.facilityType)}`}
        >
          {getFacilityTypeLabel(card.facilityType)}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{card.address}</span>
          {distanceText && (
            <span className="text-gabay-orange-600 dark:text-gabay-orange-400 font-medium">
              ({distanceText})
            </span>
          )}
        </div>

        {card.hours && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{card.hours}</span>
          </div>
        )}

        {card.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <a
              href={`tel:${card.phone}`}
              className="text-gabay-orange-600 hover:underline"
            >
              {card.phone}
            </a>
          </div>
        )}
      </div>

      {card.services && card.services.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Services:
          </p>
          <div className="flex flex-wrap gap-1">
            {card.services.slice(0, 5).map((service, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded"
              >
                {service}
              </span>
            ))}
            {card.services.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{card.services.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {card.lat && card.lng && onGetDirections && (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-gabay-orange-300 text-gabay-orange-600 hover:bg-gabay-orange-50"
          onClick={() => onGetDirections(card)}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Get Directions
        </Button>
      )}
    </div>
  );
}
