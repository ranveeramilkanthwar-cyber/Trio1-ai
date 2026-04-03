import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Zap, Globe, Send, Loader2, Star, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const BUDGETS = ['Budget Backpacker', 'Mid-range Explorer', 'Luxury Traveler'];
const PACES = ['Slow & Savoring', 'Balanced', 'Fast & Packed'];
const INTERESTS = ['Culture & History', 'Food & Cuisine', 'Adventure & Sports', 'Nature & Wildlife', 'Art & Music', 'Nightlife', 'Spirituality', 'Photography'];

export default function TravelTwin() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ budget: '', pace: '', interests: [], bio: '', next_destination: '' });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [step, setStep] = useState(1);

  const toggle = (interest) => setProfile(p => ({
    ...p, interests: p.interests.includes(interest) ? p.interests.filter(i => i !== interest) : [...p.interests, interest]
  }));

  const findTwins = async () => {
    if (!profile.budget || !profile.pace || profile.interests.length === 0) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 4 realistic "Travel Twin" profile matches for a traveler with these preferences:
Budget: ${profile.budget}
Pace: ${profile.pace}  
Interests: ${profile.interests.join(', ')}
Next destination: ${profile.next_destination || 'flexible'}

Create diverse, interesting profiles that would complement this traveler well. Each should feel like a real person.`,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
                country: { type: 'string' },
                flag: { type: 'string' },
                bio: { type: 'string' },
                budget: { type: 'string' },
                pace: { type: 'string' },
                interests: { type: 'array', items: { type: 'string' } },
                next_destination: { type: 'string' },
                compatibility: { type: 'number' },
                travel_style_note: { type: 'string' }
              }
            }
          }
        }
      }
    });
    setMatches(result.matches || []);
    setFound(true);
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Heart className="w-7 h-7 text-pink-500" /> Travel Twin
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Match with travelers who share your exact travel DNA</p>
      </div>

      {step < 3 && (
        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-bold">Your Travel Style</h3>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Budget Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {BUDGETS.map(b => (
                      <button key={b} onClick={() => setProfile(p => ({ ...p, budget: b }))}
                        className={`p-3 rounded-xl text-sm text-left border transition-all ${profile.budget === b ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                        {b === 'Budget Backpacker' ? '🎒 ' : b === 'Mid-range Explorer' ? '🏨 ' : '✨ '}{b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Travel Pace</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PACES.map(p => (
                      <button key={p} onClick={() => setProfile(pr => ({ ...pr, pace: p }))}
                        className={`p-3 rounded-xl text-sm text-left border transition-all ${profile.pace === p ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                        {p === 'Slow & Savoring' ? '🐢 ' : p === 'Balanced' ? '⚖️ ' : '⚡ '}{p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!profile.budget || !profile.pace}
                className="w-full py-3 rounded-xl font-bold text-primary-foreground disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                Next →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="glass border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-bold">Interests & Next Trip</h3>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Select your passions (pick 3+)</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(i => (
                      <button key={i} onClick={() => toggle(i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${profile.interests.includes(i) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Next destination (optional)</label>
                  <input value={profile.next_destination} onChange={e => setProfile(p => ({ ...p, next_destination: e.target.value }))}
                    placeholder="e.g. Japan, South America..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold border border-border">← Back</button>
                <button onClick={findTwins} disabled={profile.interests.length < 2 || loading}
                  className="flex-1 py-3 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                  {loading ? 'Matching...' : 'Find My Twins'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{matches.length} Twin Matches Found!</h3>
            <button onClick={() => { setStep(1); setMatches([]); }} className="text-xs text-primary hover:underline">Redo</button>
          </div>
          {matches.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass border border-border rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                  {m.flag || '👤'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{m.name}, {m.age}</p>
                      <p className="text-xs text-muted-foreground">{m.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-pink-500">{m.compatibility}%</div>
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{m.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(m.interests || []).slice(0, 3).map((int, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400">{int}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-primary">✈️ Next: {m.next_destination}</p>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Connect
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

