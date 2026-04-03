import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Layers, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CITIES = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522, color: '#00d2be', pop: '2.1M', country: 'France' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, color: '#4facfe', pop: '13.9M', country: 'Japan' },
  { name: 'New York', lat: 40.7128, lng: -74.006, color: '#f093fb', pop: '8.3M', country: 'USA' },
  { name: 'Bali', lat: -8.3405, lng: 115.0920, color: '#43e97b', pop: '4.2M', country: 'Indonesia' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, color: '#f5a623', pop: '3.3M', country: 'UAE' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, color: '#fa709a', pop: '5.3M', country: 'Australia' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, color: '#a8edea', pop: '4.6M', country: 'South Africa' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, color: '#ffecd2', pop: '2.8M', country: 'Italy' },
];

export default function MapView() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [aiInfo, setAiInfo] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [nearby, setNearby] = useState([]);

  const filtered = CITIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const selectCity = async (city) => {
    setSelected(city);
    setAiInfo('');
    setNearby([]);
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `For ${city.name}, ${city.country}, give:
1. A 2-sentence travel description
2. List 5 nearby attractions with their approximate GPS coordinates

Return JSON:
{
  "description": "...",
  "nearby": [{ "name": "...", "lat": number, "lng": number, "type": "attraction|food|nature|hotel", "distance": "Xkm" }]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          nearby: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                lat: { type: 'number' },
                lng: { type: 'number' },
                type: { type: 'string' },
                distance: { type: 'string' }
              }
            }
          }
        }
      }
    });
    setAiInfo(res.description);
    setNearby(res.nearby || []);
    setAiLoading(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020d18');

    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xaaddff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const backLight = new THREE.DirectionalLight(0x0044aa, 0.3);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Globe
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0a3060,
      emissive: 0x001830,
      specular: 0x4488cc,
      shininess: 30,
      transparent: true,
      opacity: 0.95,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(globe);

    // Grid lines on globe (lat/lng)
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1a5080, transparent: true, opacity: 0.3 });
    for (let lat = -75; lat <= 75; lat += 15) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lng * Math.PI / 180;
        pts.push(new THREE.Vector3(
          1.005 * Math.sin(phi) * Math.cos(theta),
          1.005 * Math.cos(phi),
          1.005 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lng = 0; lng < 360; lng += 15) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lng * Math.PI / 180;
        pts.push(new THREE.Vector3(
          1.005 * Math.sin(phi) * Math.cos(theta),
          1.005 * Math.cos(phi),
          1.005 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const atmosMat = new THREE.MeshPhongMaterial({
      color: 0x0066aa,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    // City markers
    const toSphere = (lat, lng, r = 1.02) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    CITIES.forEach(city => {
      const pos = toSphere(city.lat, city.lng);
      const color = new THREE.Color(city.color);

      // Dot
      const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);
      const dotMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      scene.add(dot);

      // Pulse ring
      const ringGeo = new THREE.RingGeometry(0.025, 0.035, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));
      scene.add(ring);

      // Point light
      const pLight = new THREE.PointLight(color, 0.3, 0.3);
      pLight.position.copy(pos);
      scene.add(pLight);
    });

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 4;
      starPositions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starGeo, starMat));

    let isDragging = false, prevX = 0, prevY = 0;
    let rotX = 0.3, rotY = 0;

    const onDown = (e) => { isDragging = true; prevX = e.clientX || e.touches?.[0]?.clientX; prevY = e.clientY || e.touches?.[0]?.clientY; };
    const onUp = () => isDragging = false;
    const onMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX || e.touches?.[0]?.clientX;
      const y = e.clientY || e.touches?.[0]?.clientY;
      rotY += (x - prevX) * 0.005;
      rotX += (y - prevY) * 0.003;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevX = x; prevY = y;
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchstart', onDown);
    canvas.addEventListener('touchend', onUp);
    canvas.addEventListener('touchmove', onMove);

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      if (!isDragging) rotY += 0.003;
      globe.rotation.y = rotY;
      globe.rotation.x = rotX;
      scene.children.forEach(c => {
        if (c.type === 'Mesh' && c.geometry?.type !== 'SphereGeometry') return;
        if (c !== globe) { c.rotation.y = rotY; c.rotation.x = rotX; }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mousemove', onMove);
      renderer.dispose();
    };
  }, []);

  const typeIcon = (type) => {
    const icons = { attraction: '🏛️', food: '🍜', nature: '🌿', hotel: '🏨' };
    return icons[type] || '📍';
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black font-space mb-1">3D World Map</h1>
        <p className="text-muted-foreground text-sm">Drag to rotate • Click cities to explore nearby</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Globe */}
        <div className="lg:col-span-2">
          <div className="glass border border-border rounded-2xl overflow-hidden" style={{ background: '#020d18' }}>
            <canvas ref={canvasRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height: 480 }} />
          </div>
          {/* City buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {CITIES.map(city => (
              <button key={city.name} onClick={() => selectCity(city)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                  ${selected?.name === city.name ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                <div className="w-2 h-2 rounded-full" style={{ background: city.color }} />
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search cities..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>

          {selected ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
                <h3 className="font-bold">{selected.name}</h3>
                <span className="text-xs text-muted-foreground">{selected.country}</span>
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1 bg-muted rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Population</p>
                  <p className="text-sm font-bold">{selected.pop}</p>
                </div>
                <div className="flex-1 bg-muted rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Coords</p>
                  <p className="text-xs font-mono">{selected.lat.toFixed(1)}°, {selected.lng.toFixed(1)}°</p>
                </div>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  Loading nearby info...
                </div>
              )}
              {aiInfo && <p className="text-xs text-muted-foreground mb-3">{aiInfo}</p>}

              {nearby.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Nearby Attractions</p>
                  <div className="space-y-2">
                    {nearby.map((place, i) => (
                      <a key={i}
                        href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group">
                        <span className="text-sm">{typeIcon(place.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{place.name}</p>
                          <p className="text-xs text-muted-foreground">{place.distance}</p>
                        </div>
                        <MapPin className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <a href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                <Navigation className="w-3 h-3" />
                Open in Google Maps
              </a>
            </motion.div>
          ) : (
            <div className="glass border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Destinations</span>
              </div>
              <div className="space-y-2">
                {filtered.slice(0, 8).map(city => (
                  <button key={city.name} onClick={() => selectCity(city)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: city.color }} />
                    <span className="text-xs font-medium">{city.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{city.country}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

