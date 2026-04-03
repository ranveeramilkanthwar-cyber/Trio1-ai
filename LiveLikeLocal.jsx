import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Sun, ShoppingBag, Moon, MapPin, Loader2, Users, Star, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Routine', icon: '🌅', desc: 'Chai spots, morning markets, local breakfast' },
  { id: 'afternoon', label: 'Afternoon Life', icon: '☀️', desc: 'Where locals spend their afternoons' },
  { id: 'evening', label: 'Evening Walk', icon: '🌆', desc: 'Evening promenade, sunsets, street life' },
  { id: 'weekend', label: 'Weekend Market', icon: '🛒', desc: 'Local weekend habits and haunts' },
  { id: 'full_day', label: 'Full Day Local', icon: '📅', desc: 'Complete local daily routine' },
];

export default function LiveLikeLocal() {
  const [city, setCity] = useState('');
  const [timeSlot, setTimeSlot] = useState('full_day');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!city.trim()) return;
    setLoading(true);
    const slot = TIME_SLOTS.find(t => t.id === timeSlot);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a hyper-authentic "Live Like a Local" guide for ${city}, specifically for the ${slot.label} (${slot.desc}).

Do NOT include tourist attractions, tourist restaurants, or anything found in guidebooks. Only include:
- Where actual locals go (not "local-ish" tourist spots)
- The real neighborhood names where locals live and hang out
- Specific types of places with local character
- The unwritten local social rules and customs
- What time locals actually do things (not tourist time)
- What to order, how to act, what to avoid

Make it feel like advice from a local friend, not a travel blogger.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          local_intro: { type: 'string' },
          spots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                place_type: { type: 'string' },
                neighborhood: { type: 'string' },
                what_to_do: { type: 'string' },
                insider_tip: { type: 'string' },
                cost: { type: 'string' },
                local_rule: { type: 'string' }
              }
            }
          },
          language_tips: { type: 'array', items: { type: 'string' } },
          things_to_avoid: { type: 'array', items: { type: 'string' } },
          local_secret: { type: 'string' }
        }
      }
    });
    setGuide(result);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Coffee className="w-7 h-7 text-orange-400" /> Live Like a Local
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Not tours. Just life — the way locals actually live it.</p>
      </div>

      {!guide && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass border border-border rounded-2xl p-5">
            <label className="text-sm font-medium mb-2 block">📍 Which city?</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder="e.g. Istanbul, Mumbai, Medellín..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>

          <div className="glass border border-border rounded-2xl p-5">
            <label className="text-sm font-medium mb-3 block">⏰ What part of the day?</label>
            <div className="space-y-2">
              {TIME_SLOTS.map(t => (
                <button key={t.id} onClick={() => setTimeSlot(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${timeSlot === t.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${timeSlot === t.id ? 'text-primary' : ''}`}>{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading || !city.trim()}
            className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #d97706, #dc2626)' }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Finding local spots...</> : <><Coffee className="w-5 h-5" /> Show Me Local Life</>}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {guide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Intro */}
            <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: 'linear-gradient(135deg, #92400e, #7c2d12)' }}>
              <p className="font-black text-xl mb-2">{guide.city} — Local Life</p>
              <p className="text-sm opacity-80">{guide.local_intro}</p>
            </div>

            {/* Secret */}
            {guide.local_secret && (
              <div className="glass border border-yellow-500/30 rounded-2xl p-4 mb-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">🤫</span>
                <div>
                  <p className="text-xs font-bold text-yellow-400 mb-1">Local Secret</p>
                  <p className="text-sm text-muted-foreground">{guide.local_secret}</p>
                </div>
              </div>
            )}

            {/* Spots */}
            <div className="space-y-3 mb-4">
              {(guide.spots || []).map((spot, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-orange-400">{spot.time}</span>
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                    <span className="text-xs text-muted-foreground">{spot.neighborhood}</span>
                  </div>
                  <p className="font-bold text-sm">{spot.place_type}</p>
                  <p className="text-sm text-muted-foreground mt-1">{spot.what_to_do}</p>
                  {spot.insider_tip && (
                    <div className="mt-2 flex gap-2">
                      <span className="text-primary text-xs font-bold">Insider:</span>
                      <span className="text-xs text-muted-foreground">{spot.insider_tip}</span>
                    </div>
                  )}
                  {spot.local_rule && (
                    <div className="mt-1 flex gap-2">
                      <span className="text-yellow-400 text-xs font-bold">Rule:</span>
                      <span className="text-xs text-muted-foreground">{spot.local_rule}</span>
                    </div>
                  )}
                  {spot.cost && <p className="text-xs text-green-400 mt-1">💰 {spot.cost}</p>}
                </motion.div>
              ))}
            </div>

            {/* Language tips */}
            {guide.language_tips?.length > 0 && (
              <div className="glass border border-border rounded-2xl p-4 mb-3">
                <p className="font-bold text-sm mb-2">🗣️ Blend In With These Phrases</p>
                {guide.language_tips.map((tip, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex gap-2 mb-1"><span className="text-primary">→</span>{tip}</p>
                ))}
              </div>
            )}

            {/* Things to avoid */}
            {guide.things_to_avoid?.length > 0 && (
              <div className="glass border border-red-500/20 rounded-2xl p-4 mb-3">
                <p className="font-bold text-sm text-red-400 mb-2">🚫 Avoid These (Tourist Giveaways)</p>
                {guide.things_to_avoid.map((t, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex gap-2 mb-1"><span className="text-red-400">✗</span>{t}</p>
                ))}
              </div>
            )}

            <button onClick={() => setGuide(null)} className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Try Another City / Time
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

