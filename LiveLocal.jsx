import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Coffee, MapPin, Clock, Star, Loader2, Sun, Moon, ShoppingBag, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIME_OF_DAY = [
  { id: 'morning', label: 'Morning', emoji: '🌅', desc: '6am–12pm' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️', desc: '12pm–6pm' },
  { id: 'evening', label: 'Evening', emoji: '🌆', desc: '6pm–10pm' },
  { id: 'full_day', label: 'Full Day', emoji: '🗓️', desc: 'All day' },
];

export default function LiveLocal() {
  const [city, setCity] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('full_day');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!city.trim()) return;
    setLoading(true);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a "Live Like a Local" experience guide for ${city} — ${timeOfDay}.
      
      This is NOT a tourist guide. This is what actual residents do in their daily life.
      
      Include:
      - Morning chai/coffee spot (where locals actually go, not cafés for tourists)
      - Local breakfast/lunch/dinner spots with exact neighborhood and what to order
      - Evening walk route that locals actually take
      - Weekend market or neighborhood event locals attend
      - Hidden neighborhood/area that locals love but tourists miss
      - Local rhythm: what time do locals wake up, eat, socialize?
      - 1 local to "virtually" meet: describe a local archetype and their daily routine
      - Insider tip that only people living there would know
      
      Be hyper-specific. Real neighborhood names, street names, time-of-day patterns.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          tagline: { type: 'string' },
          local_rhythm: { type: 'string' },
          morning_spot: { type: 'object', properties: { name: { type: 'string' }, neighborhood: { type: 'string' }, what_to_order: { type: 'string' }, when: { type: 'string' }, vibe: { type: 'string' } } },
          food_spots: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, meal: { type: 'string' }, neighborhood: { type: 'string' }, order: { type: 'string' }, local_tip: { type: 'string' } } } },
          evening_walk: { type: 'object', properties: { route: { type: 'string' }, description: { type: 'string' }, best_time: { type: 'string' } } },
          hidden_neighborhood: { type: 'object', properties: { name: { type: 'string' }, why_locals_love_it: { type: 'string' }, what_to_do: { type: 'string' } } },
          weekend_event: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, location: { type: 'string' } } },
          local_archetype: { type: 'object', properties: { name: { type: 'string' }, profession: { type: 'string' }, daily_routine: { type: 'string' }, favorite_spot: { type: 'string' } } },
          insider_tip: { type: 'string' }
        }
      },
      model: 'gemini_3_flash'
    });

    setGuide(res);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-space">Live Like a Local</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover the real city — the way residents actually live it.</p>
      </div>

      {!guide && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Which city?</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={city} onChange={e => setCity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder="e.g. Istanbul, Buenos Aires, Seoul..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Time of Day</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_OF_DAY.map(t => (
                <button key={t.id} onClick={() => setTimeOfDay(t.id)}
                  className={`p-3 rounded-xl border text-center transition-all
                    ${timeOfDay === t.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}>
                  <div className="text-xl mb-1">{t.emoji}</div>
                  <p className="text-xs font-bold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={generate} disabled={loading || !city.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #f59e0b)' }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting to local life...</> : <><Heart className="w-4 h-4" />Show Me Local Life</>}
          </button>
        </motion.div>
      )}

      {guide && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Header */}
          <div className="glass border border-primary/30 rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(200 80% 50% / 0.05))' }}>
            <h2 className="font-black text-xl">{guide.city}</h2>
            {guide.tagline && <p className="text-primary text-sm mt-1 italic">"{guide.tagline}"</p>}
            {guide.local_rhythm && <p className="text-muted-foreground text-sm mt-2">🕐 {guide.local_rhythm}</p>}
          </div>

          {/* Morning spot */}
          {guide.morning_spot && (
            <div className="glass border border-border rounded-2xl p-5">
              <p className="font-bold mb-3 flex items-center gap-2"><Coffee className="w-4 h-4 text-amber-500" />Local Morning Spot</p>
              <p className="font-bold text-lg">{guide.morning_spot.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{guide.morning_spot.neighborhood}</p>
              {guide.morning_spot.what_to_order && <p className="text-sm mt-2">☕ Order: <span className="font-medium">{guide.morning_spot.what_to_order}</span></p>}
              {guide.morning_spot.vibe && <p className="text-xs text-muted-foreground mt-1 italic">{guide.morning_spot.vibe}</p>}
              {guide.morning_spot.when && <p className="text-xs text-primary flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{guide.morning_spot.when}</p>}
            </div>
          )}

          {/* Food spots */}
          {guide.food_spots?.length > 0 && (
            <div className="glass border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <span className="font-bold text-sm">Where Locals Eat</span>
              </div>
              <div className="divide-y divide-border">
                {guide.food_spots.map((spot, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm">{spot.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 capitalize">{spot.meal}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">📍 {spot.neighborhood}</p>
                    {spot.order && <p className="text-xs mt-1">🍴 Get: <span className="font-medium">{spot.order}</span></p>}
                    {spot.local_tip && <p className="text-xs text-primary italic mt-1">💡 {spot.local_tip}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evening walk */}
          {guide.evening_walk && (
            <div className="glass border border-border rounded-2xl p-5">
              <p className="font-bold mb-3 flex items-center gap-2"><span className="text-lg">🚶</span>Local Evening Walk</p>
              <p className="font-medium">{guide.evening_walk.route}</p>
              <p className="text-sm text-muted-foreground mt-1">{guide.evening_walk.description}</p>
              {guide.evening_walk.best_time && <p className="text-xs text-primary mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />Best at: {guide.evening_walk.best_time}</p>}
            </div>
          )}

          {/* Hidden neighborhood */}
          {guide.hidden_neighborhood && (
            <div className="glass border border-violet-500/30 rounded-2xl p-5">
              <p className="font-bold mb-3 flex items-center gap-2 text-violet-400"><MapPin className="w-4 h-4" />Hidden Local Neighborhood</p>
              <p className="font-bold text-lg">{guide.hidden_neighborhood.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{guide.hidden_neighborhood.why_locals_love_it}</p>
              {guide.hidden_neighborhood.what_to_do && <p className="text-sm mt-2 text-primary">→ {guide.hidden_neighborhood.what_to_do}</p>}
            </div>
          )}

          {/* Local archetype */}
          {guide.local_archetype && (
            <div className="glass border border-border rounded-2xl p-5">
              <p className="font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-green-400" />Meet a Local</p>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-2xl flex-shrink-0">🧑</div>
                <div>
                  <p className="font-bold">{guide.local_archetype.name}</p>
                  <p className="text-xs text-muted-foreground">{guide.local_archetype.profession}</p>
                  <p className="text-sm text-muted-foreground mt-2">{guide.local_archetype.daily_routine}</p>
                  {guide.local_archetype.favorite_spot && <p className="text-xs text-primary mt-1">⭐ Favorite: {guide.local_archetype.favorite_spot}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Insider tip */}
          {guide.insider_tip && (
            <div className="glass border border-amber-500/30 rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">💎</span>
              <div>
                <p className="font-bold text-sm text-amber-400 mb-1">Insider Secret</p>
                <p className="text-sm text-muted-foreground">{guide.insider_tip}</p>
              </div>
            </div>
          )}

          <button onClick={() => { setGuide(null); setCity(''); }}
            className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
            Explore Another City
          </button>
        </motion.div>
      )}
    </div>
  );
}

