'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LocationRecord } from '@/types';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface LocationMapProps {
  locations: LocationRecord[];
  onLocationDelete?: (locationId: number) => void;
  height?: string;
  className?: string;
}

export default function LocationMap({ 
  locations, 
  onLocationDelete,
  height = '400px',
  className = '' 
}: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Import leaflet CSS and create custom icons
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        // Import leaflet CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
        
        // Wait for Leaflet to load
        const L = await import('leaflet');
        
        // Fix default icon issue with webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        setLeafletLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Calculate center point from locations
  const getMapCenter = (): [number, number] => {
    if (locations.length === 0) return [40.7128, -74.0060]; // Default to NYC
    
    if (locations.length === 1) {
      return [locations[0].latitude, locations[0].longitude];
    }
    
    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    
    return [avgLat, avgLng];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (!isMounted || !leafletLoaded) {
    return (
      <div 
        className={`bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div 
        className={`bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-gray-400">No locations to display</p>
          <p className="text-sm text-gray-500 mt-2">Locations will appear here when visitors access your tracking links</p>
        </div>
      </div>
    );
  }

  const center = getMapCenter();
  const zoom = locations.length === 1 ? 13 : 6;

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-600 ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup className="custom-popup">
              <div className="bg-gray-900 text-white p-3 rounded-lg min-w-[250px]">
                <h3 className="font-semibold text-lg mb-2 text-purple-300">
                  Location #{location.id}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Coordinates:</span>
                    <br />
                    <code className="text-green-300">
                      {formatCoordinates(location.latitude, location.longitude)}
                    </code>
                  </div>
                  
                  {location.accuracy && (
                    <div>
                      <span className="text-gray-400">Accuracy:</span>
                      <span className="ml-2 text-blue-300">±{location.accuracy}m</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <br />
                    <span className="text-gray-200">{formatDate(location.timestamp)}</span>
                  </div>
                  
                  {location.city && location.country && (
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <span className="ml-2 text-gray-200">{location.city}, {location.country}</span>
                    </div>
                  )}
                  
                  {location.ip_address && (
                    <div>
                      <span className="text-gray-400">IP Address:</span>
                      <span className="ml-2 text-gray-200">{location.ip_address}</span>
                    </div>
                  )}
                </div>
                
                {onLocationDelete && (
                  <button
                    onClick={() => onLocationDelete(location.id)}
                    className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded transition-colors"
                  >
                    Delete Location
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}