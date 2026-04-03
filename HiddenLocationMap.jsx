import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ExternalLink, Phone } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categoryIcons = {
  nature: '🌿', cultural: '🎭', adventure: '🧗', food: '🍜', historic: '🏛️', spiritual: '🕌'
};

function createHiddenIcon(category) {
  const emoji = categoryIcons[category] || '📍';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: linear-gradient(135deg, #7c3aed, #0d9488);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 12px rgba(124,58,237,0.4);
      border: 2px solid white;
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function HiddenLocationMap({ locations, className = "" }) {
  if (!locations || locations.length === 0) return null;

  const validLocations = locations.filter(l => l.lat && l.lng);
  if (validLocations.length === 0) return null;

  const center = [validLocations[0].lat, validLocations[0].lng];

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        {validLocations.map((loc, idx) => (
          <Marker
            key={idx}
            position={[loc.lat, loc.lng]}
            icon={createHiddenIcon(loc.category)}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <strong className="text-base">{loc.name}</strong>
                <p className="text-xs text-gray-600 mt-1">{loc.description}</p>
                <p className="text-xs mt-1">📍 {loc.city}, {loc.country}</p>
                {loc.local_contact_name && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <p className="font-medium">Local Contact: {loc.local_contact_name}</p>
                    <p>📞 {loc.local_contact_phone}</p>
                  </div>
                )}
                {loc.rating && <p className="text-xs mt-1">⭐ {loc.rating}/5</p>}
                <a
                  href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline mt-2 inline-block"
                >
                  Open in Google Maps →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

