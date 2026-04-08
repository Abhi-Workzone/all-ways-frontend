'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FiMapPin, FiSearch, FiTarget } from 'react-icons/fi';
import L from 'leaflet';

// Import hooks and components from react-leaflet normally
// We will wrap the whole Map component in dynamic import to disable SSR
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  defaultLat?: number;
  defaultLng?: number;
  defaultAddress?: string;
}

// Sub-component for handling map events
function MapHandlers({ position, setPosition, onLocationSelect }: any) {
  const map = useMap();

  // Watch for external position changes (search/geolocation) and fly map to it
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      reverseGeocode(lat, lng, onLocationSelect);
      // Removed flyTo here since the useEffect above handles all position changes now
    },
  });

  return null;
}

async function reverseGeocode(lat: number, lng: number, callback: any) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await res.json();
    callback({
      address: data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng
    });
  } catch (err) {
    console.error('Reverse geocoding error:', err);
  }
}

// The actual map logic, which will be dynamically imported
function MapView({ position, setPosition, onLocationSelect }: any) {
  return (
    <MapContainer 
      center={position} 
      zoom={14} 
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker 
        position={position} 
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const { lat, lng } = marker.getLatLng();
            setPosition([lat, lng]);
            reverseGeocode(lat, lng, onLocationSelect);
          },
        }}
      />
      <MapHandlers position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}

// Dynamic import of the MapView component
const DynamicMapView = dynamic(() => Promise.resolve(MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-soft-dark flex items-center justify-center text-[var(--text-muted)] text-xs">Loading Map...</div>
});

export default function LocationPicker({ 
  onLocationSelect, 
  defaultLat = 28.6139,
  defaultLng = 77.2090,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix leaflet marker icon paths
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Update position when default coordinates change (e.g. after profile fetch)
  useEffect(() => {
    if (typeof defaultLat === 'number' && typeof defaultLng === 'number') {
      setPosition([defaultLat, defaultLng]);
    }
  }, [defaultLat, defaultLng]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        onLocationSelect({ address: display_name, lat: newPos[0], lng: newPos[1] });
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude, onLocationSelect);
      }
    );
  };

  if (!mounted) return <div className="h-[300px] bg-soft-dark rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for area or landmark..."
            className="input-field !pl-11"
          />
        </div>
        <button 
          type="button"
          onClick={handleUseCurrentLocation}
          className="p-4 bg-[rgba(108,99,255,0.1)] text-[var(--primary)] border border-[#6C63FF]/20 rounded-xl hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-all"
        >
          <FiTarget />
        </button>
      </div>

      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-[var(--border)] relative z-10">
        <DynamicMapView 
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
        
        <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
           <div className="bg-[#0a0a0f]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--border)] text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest flex items-center gap-2">
              <FiMapPin className="text-[var(--primary)]" /> Click map or drag pin
           </div>
        </div>
      </div>
    </div>
  );
}
