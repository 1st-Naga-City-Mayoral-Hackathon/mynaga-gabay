'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { RouteCard } from '@mynaga/shared';
import {
  Navigation,
  Clock,
  Route,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import Leaflet CSS statically (Next.js handles this properly)
import 'leaflet/dist/leaflet.css';

interface RouteMapCardProps {
  card: RouteCard;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Generate external map links for navigation apps
 */
function getExternalMapLinks(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${to.lat},${to.lng}&navigate=yes&from=${from.lat},${from.lng}`;
  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${from.lat},${from.lng};${to.lat},${to.lng}`;

  return { googleMapsUrl, wazeUrl, osmUrl };
}

export function RouteMapCard({ card }: RouteMapCardProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [mapError, setMapError] = useState(false);
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Import Leaflet dynamically (CSS is imported statically above)
      // Next/Webpack interop can wrap CJS modules, so prefer `.default` when present.
      const leafletModule = (await import('leaflet')) as unknown as {
        default?: typeof import('leaflet');
      };
      const L = (leafletModule.default ?? (leafletModule as unknown)) as typeof import('leaflet');
      if (!L || typeof (L as any).map !== 'function') {
        throw new Error('Leaflet failed to load (missing L.map)');
      }

      // React 18 StrictMode mounts/unmounts effects twice in dev.
      // Leaflet tracks initialized containers via an internal `_leaflet_id` on the element.
      // If cleanup doesn't fully reset it, Leaflet will throw: "Map container is already initialized."
      const containerEl = mapContainerRef.current as unknown as Record<string, unknown>;
      if (containerEl && '_leaflet_id' in containerEl) {
        try {
          delete containerEl._leaflet_id;
        } catch {
          // ignore
        }
        // Ensure stale DOM from previous init is cleared
        mapContainerRef.current.innerHTML = '';
      }

      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Calculate bounds
      const bounds = L.latLngBounds([
        [card.from.lat, card.from.lng],
        [card.to.lat, card.to.lng],
      ]);

      // Create map
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        dragging: true,
        zoomControl: true,
      }).fitBounds(bounds, { padding: [30, 30] });

      mapInstanceRef.current = map;

      // Add OSM tile layer
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        // Keep requests lightweight
        crossOrigin: true,
      });

      // If tiles fail (network/CSP/adblock), keep the route overlay but show a clear fallback.
      tiles.on('tileerror', () => {
        console.warn('Leaflet tile failed to load');
        setMapError(true);
      });

      tiles.addTo(map);

      // Add route polyline
      const routeCoords: [number, number][] = card.geojsonLine.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );
      L.polyline(routeCoords, {
        color: '#f97316', // gabay-orange-500
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Add markers
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([card.from.lat, card.from.lng], { icon: startIcon })
        .addTo(map)
        .bindPopup(card.from.label || 'Start');

      L.marker([card.to.lat, card.to.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup(card.to.label || 'Destination');
    };

    initMap().catch((error) => {
      console.error('Failed to initialize map:', error);
      setMapError(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Also clear Leaflet container marker to avoid StrictMode double-init errors
      if (mapContainerRef.current) {
        const containerEl = mapContainerRef.current as unknown as Record<string, unknown>;
        if (containerEl && '_leaflet_id' in containerEl) {
          try {
            delete containerEl._leaflet_id;
          } catch {
            // ignore
          }
        }
        mapContainerRef.current.innerHTML = '';
      }
    };
  }, [card]);

  const { googleMapsUrl, wazeUrl } = getExternalMapLinks(card.from, card.to);
  const hasSteps = card.steps && card.steps.length > 0;

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm my-3">
      {/* Map container or fallback */}
      {mapError ? (
        <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center p-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center mb-3">
            Map could not be loaded
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Google Maps
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Waze
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div ref={mapContainerRef} className="h-48 w-full" />
      )}

      {/* Route info */}
      <div className="p-3 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Route className="w-4 h-4" />
              <span>{formatDistance(card.distanceMeters)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(card.durationSeconds)}</span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded capitalize">
            {card.profile}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-2 text-xs">
          <Navigation className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">{card.from.label || 'Your Location'}</span>
            <span className="text-muted-foreground"> to </span>
            <span className="font-medium">{card.to.label || 'Destination'}</span>
          </div>
        </div>

        {/* External map links */}
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7" asChild>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="w-3 h-3 mr-1" />
              Open in Google Maps
            </a>
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7" asChild>
            <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="w-3 h-3 mr-1" />
              Open in Waze
            </a>
          </Button>
        </div>

        {/* Text directions toggle */}
        {hasSteps && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7"
              onClick={() => setShowDirections(!showDirections)}
            >
              {showDirections ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Directions
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Text Directions ({card.steps?.length} steps)
                </>
              )}
            </Button>

            {showDirections && card.steps && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {card.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-2 text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                  >
                    <span className="flex-shrink-0 w-5 h-5 bg-gabay-orange-100 dark:bg-gabay-orange-900/30 text-gabay-orange-600 rounded-full flex items-center justify-center text-[10px] font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-foreground">{step.instruction}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {formatDistance(step.distanceMeters)} · {formatDuration(step.durationSeconds)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
