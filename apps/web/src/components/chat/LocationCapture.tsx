'use client';

import { useState, useCallback } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserLocation } from '@mynaga/shared';

interface LocationCaptureProps {
  onLocationCapture: (location: UserLocation) => void;
  onDismiss: () => void;
}

// Common barangays in Naga City for manual selection
const NAGA_BARANGAYS = [
  'Abella',
  'Bagumbayan Norte',
  'Bagumbayan Sur',
  'Balatas',
  'Calauag',
  'Centro',
  'Concepcion Grande',
  'Concepcion Pequeña',
  'Dayangdang',
  'Del Rosario',
  'Dinaga',
  'Liboton',
  'Mabolo',
  'Pacol',
  'Panicuason',
  'Peñafrancia',
  'Sabang',
  'San Felipe',
  'San Francisco',
  'Tabuco',
  'Triangulo',
];

export function LocationCapture({
  onLocationCapture,
  onDismiss,
}: LocationCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGetLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      setShowManual(true);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      onLocationCapture({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
      });
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          setError('Location permission denied. Please enter your location manually.');
          break;
        case geoError.POSITION_UNAVAILABLE:
          setError('Location unavailable. Please try again or enter manually.');
          break;
        case geoError.TIMEOUT:
          setError('Location request timed out. Please try again or enter manually.');
          break;
        default:
          setError('Failed to get location. Please enter manually.');
      }
      setShowManual(true);
    } finally {
      setIsLoading(false);
    }
  }, [onLocationCapture]);

  const geocodeManual = useCallback(async (text: string): Promise<UserLocation> => {
    setIsGeocoding(true);
    setError(null);
    try {
      const resp = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`);
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error?.message || 'Failed to geocode location');
      }
      return {
        // Prefer the resolved display name so the UI can show a friendly label first.
        manualText: json.data.displayName || text,
        lat: json.data.lat,
        lng: json.data.lng,
      };
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleManualSubmit = useCallback(async () => {
    if (!manualInput.trim()) return;
    try {
      const loc = await geocodeManual(manualInput.trim());
      onLocationCapture(loc);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to geocode location');
      onLocationCapture({ manualText: manualInput.trim() });
    }
  }, [manualInput, onLocationCapture, geocodeManual]);

  const handleBarangaySelect = useCallback(
    async (barangay: string) => {
      const text = `${barangay}, Naga City`;
      try {
        const loc = await geocodeManual(text);
        onLocationCapture(loc);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to geocode location');
        onLocationCapture({ manualText: text });
      }
    },
    [onLocationCapture, geocodeManual]
  );

  return (
    <div className="px-4 py-3 bg-gabay-orange-50 dark:bg-gabay-orange-950/30 border-b border-gabay-orange-200 dark:border-gabay-orange-800">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gabay-orange-500" />
          <p className="text-sm font-medium">Share your location</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        To find nearby health facilities and provide directions, we need your
        location. You can share GPS or enter your barangay manually.
      </p>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}

      {!showManual ? (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleGetLocation}
            disabled={isLoading}
            className="bg-gabay-orange-500 hover:bg-gabay-orange-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-1" />
            )}
            Use GPS Location
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManual(true)}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Enter Manually
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Quick barangay selection */}
          <div>
            <p className="text-xs font-medium mb-2">Quick select (Naga City):</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {NAGA_BARANGAYS.map((barangay) => (
                <button
                  key={barangay}
                  onClick={() => handleBarangaySelect(barangay)}
                  className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-800 hover:border-gabay-orange-300 hover:bg-gabay-orange-50 dark:hover:bg-gabay-orange-900/20 transition-colors"
                >
                  {barangay}
                </button>
              ))}
            </div>
          </div>

          {/* Manual text input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter address or landmark..."
              className="flex-1 text-sm px-3 py-1.5 border rounded-md bg-white dark:bg-gray-800"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim() || isGeocoding}
              className="bg-gabay-orange-500 hover:bg-gabay-orange-600"
            >
              {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set'}
            </Button>
          </div>

          {/* Retry GPS button */}
          <button
            onClick={() => {
              setShowManual(false);
              handleGetLocation();
            }}
            className="text-xs text-gabay-orange-600 hover:underline"
          >
            Try GPS again
          </button>
        </div>
      )}
    </div>
  );
}
