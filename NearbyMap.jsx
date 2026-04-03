import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const youIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background: #0d9488;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 12px #0d9488;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function NearbyMap({ places = [], className = "" }) {
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        () => {
          setUserPos([28.6139, 77.2090]); // Default to Delhi
          setLoading(false);
        }
      );
    } else {
      setUserPos([28.6139, 77.2090]);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={userPos}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <Marker position={userPos} icon={youIcon}>
          <Popup>📍 Your Location</Popup>
        </Marker>
        <Circle center={userPos} radius={5000} pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.05 }} />
        {places.map((place, idx) => (
          <Marker key={idx} position={[place.lat, place.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{place.name}</strong>
                {place.description && <p className="text-xs mt-1">{place.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

