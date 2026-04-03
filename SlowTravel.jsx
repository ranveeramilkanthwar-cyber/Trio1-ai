import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Loader2, Clock, DollarSign, Leaf, ArrowRight, TrendingDown, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SlowTravel() {
  const [form, setForm] = useState({ destination: '', days: 10, budget_per_day: 100, current_stops: 3, preferred_stops: '' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.destination) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a slow travel plan for ${form.destination} for ${form.days} days with a budget of $${form.budget_per_day}/day.
Current rushed plan: ${form.current_stops} stops in ${form.days} days.
${form.preferred_stops ? `Preferred slow stops: ${form.preferred_stops}` : ''}

Generate a slow travel alternative that:
1. Focuses on 2-3 destinations max for deeper immersion
2. Calculates realistic cost savings (negotiated accommodation rates, local food, etc.)
3. Calculates CO2 savings vs rushing
4. Shows what deeper experiences you gain
5. Gives a realistic day-by-day structure
6. Suggests neighborhood types to stay in (not tourist centers)`,
      response_json_schema: {
        type: 'object',
        properties: {
          rushed_summary: { type: 'string' },
          slow_summary: { type: 'string' },
          savings: {
            type: 'object',
            properties: {
              cost_saved: { type: 'number' },
              co2_saved_kg: { type: 'number' },
              extra_days_per_place: { type: 'number' }
            }
          },
          itinerary: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                place: { type: 'string' },
                days: { type: 'number' },
                where_to_stay: { type: 'string' },
                daily_cost: { type: 'number' },
                slow_experiences: { type: 'array', items: { type: 'string' } },
                why_this_long: { type: 'string' }
              }
            }
          },
          what_you_gain: { type: 'array', items: { type: 'string' } },
          manifesto_line: { type: 'string' }
        }
      }
    });
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <TreePine className="w-7 h-7 text-green-500" /> Slow Travel Planner
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Stay longer, spend less, experience more</p>
      </div>

      {!plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">🌍 Where are you going?</label>
            <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              placeholder="Region or country, e.g. Southeast Asia, Portugal"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">📅 Total days</label>
              <input type="number" value={form.days} onChange={e => setForm(f => ({ ...f, days: +e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">💰 Budget/day ($)</label>
              <input type="number" value={form.budget_per_day} onChange={e => setForm(f => ({ ...f, budget_per_day: +e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">🏃 How many stops in your current rushed plan?</label>
            <input type="number" value={form.current_stops} onChange={e => setForm(f => ({ ...f, current_stops: +e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <button onClick={generate} disabled={loading || !form.destination}
            className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Planning your slow journey...</> : <><TreePine className="w-5 h-5" /> Plan Slow Trip</>}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Manifesto */}
            {plan.manifesto_line && (
              <div className="rounded-2xl p-5 text-white text-center" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                <TreePine className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-lg font-bold italic">"{plan.manifesto_line}"</p>
              </div>
            )}

            {/* Savings */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Money Saved', value: `$${plan.savings?.cost_saved || 0}`, icon: DollarSign, color: 'text-green-400' },
                { label: 'CO₂ Saved', value: `${plan.savings?.co2_saved_kg || 0}kg`, icon: Leaf, color: 'text-teal-400' },
                { label: 'Extra days/place', value: `+${plan.savings?.extra_days_per_place || 0}`, icon: Clock, color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="glass border border-border rounded-2xl p-3 text-center">
                  <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Comparison */}
            <div className="glass border border-border rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-400 mb-1">❌ Rushed Plan</p>
                  <p className="text-xs text-muted-foreground">{plan.rushed_summary}</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-3">
                  <p className="text-xs font-bold text-green-400 mb-1">✅ Slow Plan</p>
                  <p className="text-xs text-muted-foreground">{plan.slow_summary}</p>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="space-y-3">
              {(plan.itinerary || []).map((stop, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass border border-green-500/20 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-black text-lg">{stop.place}</h3>
                      <p className="text-sm text-green-400 font-bold">{stop.days} days · ${stop.daily_cost}/day</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Stay: {stop.where_to_stay}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 italic">{stop.why_this_long}</p>
                  <div className="space-y-1">
                    {(stop.slow_experiences || []).map((exp, j) => (
                      <p key={j} className="text-sm flex gap-2"><span className="text-green-400">→</span>{exp}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* What you gain */}
            {plan.what_you_gain?.length > 0 && (
              <div className="glass border border-border rounded-2xl p-4">
                <p className="font-bold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> What you gain</p>
                {plan.what_you_gain.map((g, i) => (
                  <p key={i} className="text-sm flex gap-2 mb-1"><span className="text-primary">✓</span>{g}</p>
                ))}
              </div>
            )}

            <button onClick={() => setPlan(null)} className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Plan Another Trip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

