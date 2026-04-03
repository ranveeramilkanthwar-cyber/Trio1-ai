

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Loader2, MapPin, Clock, Sun, Moon, Coffee, Zap, Battery, Users, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const MOODS = [
  { id: 'adventurous', emoji: '⚡', label: 'Adventurous', desc: 'High energy, let\'s do everything!', color: 'from-orange-500 to-red-500' },
  { id: 'lazy', emoji: '😴', label: 'Lazy & Chill', desc: 'Slow morning, good vibes only', color: 'from-blue-500 to-purple-500' },
  { id: 'social', emoji: '🎉', label: 'Social Butterfly', desc: 'Meet people, busy spots', color: 'from-pink-500 to-rose-500' },
  { id: 'solo', emoji: '🧘', label: 'Solo & Reflective', desc: 'Quiet spots, inner peace', color: 'from-teal-500 to-cyan-500' },
  { id: 'foodie', emoji: '🍽️', label: 'Foodie Mode', desc: 'It\'s all about the food today', color: 'from-yellow-500 to-orange-500' },
  { id: 'cultural', emoji: '🏛️', label: 'Culture Vulture', desc: 'Museums, history, art', color: 'from-purple-500 to-indigo-500' },
];

const ENERGY = [
  { id: 'low', label: 'Low ⚡', desc: 'Take it easy' },
  { id: 'medium', label: 'Medium ⚡⚡', desc: 'Comfortable pace' },
  { id: 'high', label: 'High ⚡⚡⚡', desc: 'Go full throttle' },
];

export default function MoodItinerary() {
  const { user } = useAuth();
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState('medium');
  const [city, setCity] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!mood || !city.trim()) return;
    setLoading(true);
    const selectedMood = MOODS.find(m => m.id === mood);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a mood-based day itinerary for a traveler in ${city}. 
Mood: ${selectedMood.label} - ${selectedMood.desc}
Energy level: ${energy}
Time: Today (adapt to mood - if lazy, start late; if adventurous, start early)

Build a realistic, flowing day plan that perfectly matches this mood and energy. Include approximate times, why each spot fits the mood, and honest descriptions.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          mood_title: { type: 'string' },
          day_summary: { type: 'string' },
          wake_time: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                place: { type: 'string' },
                activity: { type: 'string' },
                why_it_fits: { type: 'string' },
                duration: { type: 'string' },
                vibe: { type: 'string' }
              }
            }
          },
          mood_tip: { type: 'string' },
          end_note: { type: 'string' }
        }
      }
    });
    setPlan(result);
    setLoading(false);
  };

  const vibeColors = { calm: 'text-blue-400', energetic: 'text-orange-400', social: 'text-pink-400', quiet: 'text-teal-400', cultural: 'text-purple-400', tasty: 'text-yellow-400' };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Smile className="w-7 h-7 text-yellow-400" /> Mood-Based Itinerary
        </h1>
        <p className="text-muted-foreground text-sm mt-1">How are you feeling today? We'll plan accordingly.</p>
      </div>

      {!plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="glass border border-border rounded-2xl p-5">
            <label className="text-sm font-medium mb-3 block">🌍 Which city are you in?</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder="Current city..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
          </div>

          <div className="glass border border-border rounded-2xl p-5">
            <label className="text-sm font-medium mb-3 block">😊 How are you feeling?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)}
                  className={`p-4 rounded-2xl border text-center transition-all ${mood === m.id ? 'border-primary scale-[1.03]' : 'border-border hover:border-primary/40'}`}
                  style={mood === m.id ? { background: `linear-gradient(135deg, ${m.color.replace('from-', '').replace(' to-', ', ')})`, color: 'white' } : {}}>
                  <div className="text-3xl mb-1">{m.emoji}</div>
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-xs opacity-70 mt-0.5 leading-tight">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass border border-border rounded-2xl p-5">
            <label className="text-sm font-medium mb-3 block">⚡ Energy level?</label>
            <div className="grid grid-cols-3 gap-3">
              {ENERGY.map(e => (
                <button key={e.id} onClick={() => setEnergy(e.id)}
                  className={`p-3 rounded-xl border text-center text-sm transition-all ${energy === e.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                  <div className="font-bold text-xs">{e.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{e.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={!mood || !city.trim() || loading}
            className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Building your mood plan...</> : <><Smile className="w-5 h-5" /> Plan My Day</>}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Mood header */}
            <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${MOODS.find(m => m.id === mood)?.color.replace('from-', '').split(' to-').join(', ')})` }}>
              <div className="text-4xl mb-2">{MOODS.find(m => m.id === mood)?.emoji}</div>
              <h2 className="text-xl font-black">{plan.mood_title}</h2>
              <p className="text-white/80 text-sm mt-1">{plan.day_summary}</p>
              {plan.mood_tip && <p className="text-white/70 text-xs mt-2 italic">💡 {plan.mood_tip}</p>}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-medium">Wake up at {plan.wake_time}</p>
            </div>

            <div className="space-y-3">
              {(plan.activities || []).map((act, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass border border-border rounded-2xl p-4 flex gap-4">
                  <div className="text-center flex-shrink-0 w-14">
                    <p className="text-xs font-bold text-primary">{act.time}</p>
                    <p className="text-xs text-muted-foreground">{act.duration}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{act.place}</p>
                    <p className="text-sm text-muted-foreground">{act.activity}</p>
                    <p className="text-xs text-primary mt-1 italic">{act.why_it_fits}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {plan.end_note && (
              <div className="mt-4 glass border border-border rounded-xl p-4 text-sm text-muted-foreground text-center italic">
                🌙 {plan.end_note}
              </div>
            )}

            <button onClick={() => setPlan(null)} className="w-full mt-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Plan Another Day
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}