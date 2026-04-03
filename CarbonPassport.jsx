import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Plus, TreePine, Plane, Train, Bus, Car, Ship, Loader2, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const TRANSPORT_ICONS = { flight: Plane, train: Train, bus: Bus, car: Car, ship: Ship };
const TRANSPORT_CO2 = { flight: 0.255, train: 0.041, bus: 0.089, car: 0.171, ship: 0.245 }; // kg CO2 per km per passenger

const LEVELS = [
  { max: 500, label: 'Green Traveler', color: 'text-green-400', bg: 'from-green-500 to-teal-500', emoji: '🌿' },
  { max: 2000, label: 'Conscious Explorer', color: 'text-yellow-400', bg: 'from-yellow-500 to-orange-500', emoji: '⚖️' },
  { max: 99999, label: 'Carbon Heavyweight', color: 'text-red-400', bg: 'from-red-500 to-orange-600', emoji: '🔥' },
];

export default function CarbonPassport() {
  const { user } = useAuth();
  const [footprints, setFootprints] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ destination: '', transport_type: 'flight', distance_km: '' });
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      base44.entities.CarbonFootprint.filter({ user_email: user.email }).then(setFootprints);
    }
  }, [user]);

  const totalCO2 = footprints.reduce((s, f) => s + (f.co2_kg || 0), 0);
  const level = LEVELS.find(l => totalCO2 <= l.max) || LEVELS[2];

  const addEntry = async () => {
    if (!form.destination || !form.distance_km) return;
    setLoading(true);
    const co2 = Math.round(TRANSPORT_CO2[form.transport_type] * parseFloat(form.distance_km));
    const trees = Math.ceil(co2 / 21); // avg tree absorbs 21kg CO2/year
    const entry = await base44.entities.CarbonFootprint.create({
      user_email: user.email,
      destination: form.destination,
      transport_type: form.transport_type,
      distance_km: parseFloat(form.distance_km),
      co2_kg: co2,
      offset_trees: trees,
      offset_status: 'none',
      trip_id: '',
    });
    setFootprints(prev => [entry, ...prev]);
    setForm({ destination: '', transport_type: 'flight', distance_km: '' });
    setShowAdd(false);
    setLoading(false);
  };

  const getGreenerAlternative = async (entry) => {
    setSuggestLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `A traveler is going from their location to ${entry.destination} by ${entry.transport_type} (${entry.distance_km}km, ${entry.co2_kg}kg CO2). Suggest 2 greener alternatives with estimated CO2 savings, including realistic options like trains, buses, or direct vs connecting flights. Keep it concise.`,
    });
    setSuggestion({ text: res, for: entry.destination });
    setSuggestLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Leaf className="w-7 h-7 text-green-500" /> Carbon Passport
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track your travel footprint, travel greener</p>
      </div>

      {/* Passport card */}
      <div className="rounded-3xl p-6 mb-6 text-white" style={{ background: 'linear-gradient(160deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs opacity-60 tracking-widest uppercase">Carbon Passport</p>
            <p className="text-xl font-black mt-1">{user?.full_name || 'Traveler'}</p>
          </div>
          <div className="text-4xl">{level.emoji}</div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{Math.round(totalCO2)}</p>
            <p className="text-xs opacity-70">kg CO₂</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{footprints.length}</p>
            <p className="text-xs opacity-70">Trips</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-300">{footprints.reduce((s, f) => s + (f.offset_trees || 0), 0)}</p>
            <p className="text-xs opacity-70">Trees needed</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="font-bold">{level.label}</p>
          <p className="text-xs opacity-70 mt-0.5">{totalCO2 < 500 ? 'Keep it up! You\'re leading by example.' : totalCO2 < 2000 ? 'Not bad — consider greener options.' : 'Time to offset and rethink travel choices.'}</p>
        </div>
      </div>

      <button onClick={() => setShowAdd(!showAdd)}
        className="w-full py-3 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 mb-5"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
        <Plus className="w-4 h-4" /> Log a Trip
      </button>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-border rounded-2xl p-5 mb-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Destination</label>
            <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              placeholder="e.g. Bali, Indonesia"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Transport</label>
              <select value={form.transport_type} onChange={e => setForm(f => ({ ...f, transport_type: e.target.value }))}
                className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none">
                {Object.keys(TRANSPORT_CO2).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Distance (km)</label>
              <input type="number" value={form.distance_km} onChange={e => setForm(f => ({ ...f, distance_km: e.target.value }))}
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          {form.distance_km && (
            <div className="text-xs text-muted-foreground bg-muted rounded-xl p-3">
              Estimated CO₂: <span className="font-bold text-orange-400">{Math.round(TRANSPORT_CO2[form.transport_type] * parseFloat(form.distance_km || 0))} kg</span>
            </div>
          )}
          <button onClick={addEntry} disabled={loading || !form.destination || !form.distance_km}
            className="w-full py-3 rounded-xl font-bold text-primary-foreground disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            {loading ? 'Saving...' : 'Add Trip'}
          </button>
        </motion.div>
      )}

      {suggestion && (
        <div className="glass border border-green-500/30 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-green-400 mb-2">🌿 Greener alternatives for {suggestion.for}</p>
          <p className="text-sm text-muted-foreground">{suggestion.text}</p>
        </div>
      )}

      <div className="space-y-3">
        {footprints.map((f, i) => {
          const Icon = TRANSPORT_ICONS[f.transport_type] || Plane;
          return (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="glass border border-border rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{f.destination}</p>
                <p className="text-xs text-muted-foreground capitalize">{f.transport_type} · {f.distance_km}km</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-400">{f.co2_kg}kg</p>
                <button onClick={() => getGreenerAlternative(f)} className="text-xs text-green-400 hover:underline">
                  {suggestLoading ? '...' : 'Go greener'}
                </button>
              </div>
            </motion.div>
          );
        })}
        {footprints.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <TreePine className="w-12 h-12 mx-auto mb-3 text-green-400/40" />
            <p>No trips logged yet. Start tracking your footprint!</p>
          </div>
        )}
      </div>
    </div>
  );
}

