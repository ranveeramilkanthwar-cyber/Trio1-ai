import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Luggage, Check, AlertTriangle, Loader2, RefreshCw, Download, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ACTIVITIES = ['Beach', 'Hiking', 'Business', 'Nightlife', 'Camping', 'City Sightseeing', 'Skiing', 'Religious Sites'];

export default function PackingAI() {
  const { user } = useAuth();
  const [form, setForm] = useState({ destination: '', duration: 7, activities: [], airline: '' });
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedList, setSavedList] = useState(null);

  const toggle = (a) => setForm(f => ({
    ...f, activities: f.activities.includes(a) ? f.activities.filter(x => x !== a) : [...f.activities, a]
  }));

  const generate = async () => {
    if (!form.destination) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive packing list for a ${form.duration}-day trip to ${form.destination}. 
Activities: ${form.activities.join(', ') || 'General sightseeing'}. 
Airline: ${form.airline || 'standard'}.

Include all categories: clothing, toiletries, electronics, documents, health & medications, and accessories.
Flag items that might have airline restrictions or customs issues. Mark essential items. Include specific quantity recommendations.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          destination_notes: { type: 'string' },
          weather_tip: { type: 'string' },
          airline_warnings: { type: 'array', items: { type: 'string' } },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                emoji: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      quantity: { type: 'string' },
                      essential: { type: 'boolean' },
                      warning: { type: 'string' },
                      packed: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    setList(result);
    if (user?.email) {
      const allItems = (result.categories || []).flatMap(c => c.items || []);
      const saved = await base44.entities.PackingList.create({
        user_email: user.email,
        trip_destination: form.destination,
        duration_days: form.duration,
        activities: form.activities.join(', '),
        items: allItems,
        airline: form.airline,
        warnings: result.airline_warnings || [],
      });
      setSavedList(saved);
    }
    setLoading(false);
  };

  const togglePacked = (catIdx, itemIdx) => {
    setList(prev => {
      const updated = { ...prev };
      updated.categories = updated.categories.map((c, ci) => ci !== catIdx ? c : {
        ...c,
        items: c.items.map((item, ii) => ii !== itemIdx ? item : { ...item, packed: !item.packed })
      });
      return updated;
    });
  };

  const totalItems = list?.categories?.reduce((s, c) => s + (c.items?.length || 0), 0) || 0;
  const packedItems = list?.categories?.reduce((s, c) => s + (c.items?.filter(i => i.packed)?.length || 0), 0) || 0;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Luggage className="w-7 h-7 text-primary" /> Packing AI
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Smart packing list with airline restriction warnings</p>
      </div>

      {!list && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">✈️ Destination</label>
            <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              placeholder="e.g. Tokyo, Japan"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">📅 Duration (days)</label>
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} min={1} max={60}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">🛫 Airline (optional)</label>
              <input value={form.airline} onChange={e => setForm(f => ({ ...f, airline: e.target.value }))}
                placeholder="e.g. Ryanair"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">🎯 Activities</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map(a => (
                <button key={a} onClick={() => toggle(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.activities.includes(a) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generate} disabled={loading || !form.destination}
            className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Building your list...</> : <><Luggage className="w-5 h-5" /> Generate Packing List</>}
          </button>
        </motion.div>
      )}

      {list && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Progress */}
          <div className="glass border border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Packing Progress</span>
              <span className="font-bold text-primary">{packedItems}/{totalItems}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary"
                animate={{ width: `${totalItems ? (packedItems / totalItems) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{list.weather_tip}</p>
          </div>

          {/* Airline warnings */}
          {list.airline_warnings?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
              <p className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Airline Restrictions</p>
              {list.airline_warnings.map((w, i) => <p key={i} className="text-xs text-muted-foreground">• {w}</p>)}
            </div>
          )}

          {/* Destination notes */}
          {list.destination_notes && (
            <div className="glass border border-border rounded-xl p-3 mb-4 text-sm text-muted-foreground">
              💡 {list.destination_notes}
            </div>
          )}

          {/* Categories */}
          {(list.categories || []).map((cat, ci) => (
            <motion.div key={ci} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}
              className="glass border border-border rounded-2xl overflow-hidden mb-3">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-bold text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {cat.items?.filter(i => i.packed).length}/{cat.items?.length} packed
                </span>
              </div>
              <div className="divide-y divide-border">
                {(cat.items || []).map((item, ii) => (
                  <div key={ii} onClick={() => togglePacked(ci, ii)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${item.packed ? 'opacity-50' : ''}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.packed ? 'bg-primary border-primary' : 'border-border'}`}>
                      {item.packed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${item.packed ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                      {item.quantity && <span className="text-xs text-muted-foreground ml-2">×{item.quantity}</span>}
                      {item.warning && <p className="text-xs text-orange-400 mt-0.5">⚠️ {item.warning}</p>}
                    </div>
                    {item.essential && <span className="text-xs text-primary font-bold">Essential</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <button onClick={() => setList(null)} className="w-full mt-2 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Start Over
          </button>
        </motion.div>
      )}
    </div>
  );
}

