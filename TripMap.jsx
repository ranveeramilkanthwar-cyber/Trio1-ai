import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const dayColors = ['#0d9488', '#7c3aed', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#10b981'];

function createDayIcon(dayNum) {
  const color = dayColors[(dayNum - 1) % dayColors.length];
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 2px 8px ${color}66;
      border: 2px solid white;
    ">D${dayNum}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function TripMap({ itinerary, selectedDay, className = "" }) {
  if (!itinerary || itinerary.length === 0) return null;

  const allPlaces = [];
  const filteredDays = selectedDay ? itinerary.filter(d => d.day === selectedDay) : itinerary;

  filteredDays.forEach(day => {
    (day.places || []).forEach(place => {
      if (place.lat && place.lng) {
        allPlaces.push({ ...place, day: day.day });
      }
    });
  });

  if (allPlaces.length === 0) return null;

  const center = [allPlaces[0].lat, allPlaces[0].lng];
  const positions = allPlaces.map(p => [p.lat, p.lng]);

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        {allPlaces.map((place, idx) => (
          <Marker
            key={idx}
            position={[place.lat, place.lng]}
            icon={createDayIcon(place.day)}
          >
            <Popup>
              <div className="text-sm">
                <strong>Day {place.day}: {place.name}</strong>
                {place.time && <p className="text-xs mt-1">🕐 {place.time}</p>}
                {place.description && <p className="text-xs mt-1">{place.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#0d9488', weight: 3, opacity: 0.7, dashArray: '10, 6' }}
          />
        )}
      </MapContainer>
    </div>
  );
}

