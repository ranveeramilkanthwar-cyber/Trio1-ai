import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';

const DAY_COLORS = ['#00d2be', '#4facfe', '#f093fb', '#f5a623', '#43e97b', '#fa709a', '#a8edea'];

export default function TripMap3D({ itinerary, selectedDay, destination }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);

  // Get places to show
  const placesToShow = selectedDay === 0
    ? itinerary.flatMap((day, i) => day.places?.map(p => ({ ...p, day: day.day, color: DAY_COLORS[i % DAY_COLORS.length] })) || [])
    : itinerary.filter(d => d.day === selectedDay).flatMap((day, i) => day.places?.map(p => ({ ...p, day: day.day, color: DAY_COLORS[(selectedDay - 1) % DAY_COLORS.length] })) || []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || placesToShow.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a1628');

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0x00d2be, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Ground plane with grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x1a3a5c, 0x0d2440);
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a1e35, transparent: true, opacity: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    // Normalize coordinates
    const lats = placesToShow.filter(p => p.lat).map(p => p.lat);
    const lngs = placesToShow.filter(p => p.lng).map(p => p.lng);
    if (lats.length === 0) return;

    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.1;
    const lngRange = maxLng - minLng || 0.1;
    const scale = 14;

    const toPos = (lat, lng) => ({
      x: ((lng - minLng) / lngRange - 0.5) * scale,
      z: ((lat - minLat) / latRange - 0.5) * scale * -1,
    });

    // Place markers
    const markers = [];
    placesToShow.forEach((place, i) => {
      if (!place.lat || !place.lng) return;
      const { x, z } = toPos(place.lat, place.lng);

      const color = new THREE.Color(place.color || '#00d2be');

      // Pin base
      const pinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
      const pinMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, 0.4, z);
      scene.add(pin);

      // Sphere top
      const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(x, 0.9, z);
      scene.add(sphere);
      markers.push({ sphere, baseY: 0.9, i });

      // Ring
      const ringGeo = new THREE.RingGeometry(0.3, 0.4, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.05, z);
      scene.add(ring);

      // Point light
      const pLight = new THREE.PointLight(color, 0.5, 3);
      pLight.position.set(x, 1, z);
      scene.add(pLight);
    });

    // Connection lines between places of same day
    const dayGroups = {};
    placesToShow.forEach(p => {
      if (!dayGroups[p.day]) dayGroups[p.day] = [];
      dayGroups[p.day].push(p);
    });

    Object.entries(dayGroups).forEach(([day, places], di) => {
      const color = new THREE.Color(DAY_COLORS[di % DAY_COLORS.length]);
      for (let i = 0; i < places.length - 1; i++) {
        if (!places[i].lat || !places[i + 1].lat) continue;
        const from = toPos(places[i].lat, places[i].lng);
        const to = toPos(places[i + 1].lat, places[i + 1].lng);
        const pts = [];
        for (let t = 0; t <= 20; t++) {
          const tt = t / 20;
          pts.push(new THREE.Vector3(
            from.x + (to.x - from.x) * tt,
            0.5 + Math.sin(tt * Math.PI) * 1.2,
            from.z + (to.z - from.z) * tt
          ));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const lineGeo = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
        const lineMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, transparent: true, opacity: 0.7 });
        scene.add(new THREE.Mesh(lineGeo, lineMat));
      }
    });

    // Rotation
    let angle = 0;
    const radius = 16;
    const cameraHeight = 10;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      angle += 0.004;
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = cameraHeight;
      camera.lookAt(0, 0, 0);

      // Bounce markers
      markers.forEach(({ sphere, baseY, i }) => {
        sphere.position.y = baseY + Math.sin(Date.now() * 0.002 + i) * 0.1;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
    };
  }, [placesToShow.length, selectedDay]);

  return (
    <div className="glass border border-border rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {selectedDay === 0 ? 'Full Trip Map' : `Day ${selectedDay} Map`} — {destination}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{placesToShow.length} locations</span>
      </div>
      {placesToShow.length > 0 ? (
        <canvas ref={canvasRef} className="w-full" style={{ height: 380 }} />
      ) : (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No location data available
        </div>
      )}
      <div className="p-3 flex flex-wrap gap-2">
        {itinerary.map((day, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: DAY_COLORS[i % DAY_COLORS.length] }} />
            Day {day.day}: {day.title}
          </div>
        ))}
      </div>
    </div>
  );
}

