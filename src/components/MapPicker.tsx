import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  address?: string;
  readOnly?: boolean;
  onLocationChange?: (lat: number, lng: number, address?: string) => void;
  height?: string;
  className?: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  address,
  readOnly = false,
  onLocationChange,
  height = '320px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Custom SVG Pin Icon to avoid broken image asset paths
  const customPinIcon = L.divIcon({
    className: 'custom-civic-pin',
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
        <div style="width: 34px; height: 34px; border-radius: 50%; background: #1D4ED8; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #1D4ED8; margin-top: -2px;"></div>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: !readOnly,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([latitude, longitude], {
        icon: customPinIcon,
        draggable: !readOnly,
      }).addTo(map);

      if (address) {
        marker.bindPopup(`<b>Report Location</b><br/>${escapeHtml(address)}`).openPopup();
      }

      markerRef.current = marker;

      if (!readOnly) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          if (onLocationChange) {
            onLocationChange(pos.lat, pos.lng);
          }
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          map.panTo(e.latlng);
          if (onLocationChange) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
          }
        });
      }

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], map.getZoom() || 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        if (address) {
          markerRef.current.bindPopup(`<b>Report Location</b><br/>${escapeHtml(address)}`);
        }
      }
    }

    // Leaflet needs invalidateSize after container renders
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [latitude, longitude, readOnly]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        if (onLocationChange) {
          onLocationChange(lat, lng, 'Current GPS Location Detected');
        }
      },
      (err) => {
        setLocating(false);
        setGeoError(`Location access denied or unavailable (${err.message}). Set the issue location on the map.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 ${className}`}>
      <div ref={mapContainerRef} style={{ height }} className="w-full relative z-0" />

      {/* Map toolbar controls */}
      {!readOnly && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-slate-800 rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Detect GPS Location"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>
      )}

      {/* Coordinate & info bar at bottom */}
      <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-sm pointer-events-auto flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-mono tabular-nums text-slate-700">
              {Math.abs(latitude).toFixed(5)}° {latitude < 0 ? 'S' : 'N'}, {Math.abs(longitude).toFixed(5)}° {longitude < 0 ? 'W' : 'E'}
            </span>
          </div>
          {!readOnly && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Click map or drag marker to reposition
            </span>
          )}
        </div>
      </div>

      {geoError && (
        <div className="absolute top-3 left-3 right-16 z-10 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span className="truncate">{geoError}</span>
        </div>
      )}
    </div>
  );
};
