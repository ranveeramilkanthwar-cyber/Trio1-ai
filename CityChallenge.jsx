import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, Circle, Clock, Trophy, RefreshCw, Loader2, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function CityChallenge() {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(null);

  const generate = async () => {
    if (!city.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 8 fun, creative 24-hour city challenges for a traveler arriving in ${city}. Mix easy (3pts), medium (5pts), and hard (10pts). Make them hyper-local, quirky, and authentic — NOT generic tourist stuff. Examples: find a café with no English menu, photograph a stray cat, buy something from a street vendor using only hand gestures, etc.`,
      response_json_schema: {
        type: 'object',
        properties: {
          challenges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                text: { type: 'string' },
                emoji: { type: 'string' },
                points: { type: 'number' },
                difficulty: { type: 'string' }
              }
            }
          },
          city_fact: { type: 'string' }
        }
      }
    });

    const challenges = (result.challenges || []).map(c => ({ ...c, completed: false }));
    setChallenge({ ...result, challenges, city });

    if (user?.email) {
      const saved = await base44.entities.CityChallenge.create({
        user_email: user.email,
        city,
        challenges,
        total_points: 0,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
      });
      setSaved(saved);
    }
    setLoading(false);
  };

  const toggle = async (idx) => {
    const updated = challenge.challenges.map((c, i) => i === idx ? { ...c, completed: !c.completed } : c);
    setChallenge(prev => ({ ...prev, challenges: updated }));
    if (saved?.id) {
      const total = updated.filter(c => c.completed).reduce((s, c) => s + (c.points || 0), 0);
      await base44.entities.CityChallenge.update(saved.id, { challenges: updated, total_points: total });
    }
  };

  const completed = challenge?.challenges?.filter(c => c.completed).length || 0;
  const totalPoints = challenge?.challenges?.filter(c => c.completed).reduce((s, c) => s + (c.points || 0), 0) || 0;
  const maxPoints = challenge?.challenges?.reduce((s, c) => s + (c.points || 0), 0) || 0;

  const diffColor = (d) => ({ easy: 'text-green-400 bg-green-500/10', medium: 'text-yellow-400 bg-yellow-500/10', hard: 'text-red-400 bg-red-500/10' }[d] || 'text-primary bg-primary/10');

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Zap className="w-7 h-7 text-yellow-400" /> City Challenge Mode
        </h1>
        <p className="text-muted-foreground text-sm mt-1">24-hour quests to explore like a local</p>
      </div>

      {/* City input */}
      <div className="glass border border-border rounded-2xl p-5 mb-5">
        <label className="text-sm font-medium mb-2 flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" /> Which city are you in?
        </label>
        <div className="flex gap-3">
          <input value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. Bangkok, Lisbon, Nairobi..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
          <button onClick={generate} disabled={loading || !city.trim()}
            className="px-5 py-3 rounded-xl font-bold text-white flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Start!'}
          </button>
        </div>
      </div>

      {/* Challenges */}
      <AnimatePresence>
        {challenge && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Completed', value: `${completed}/${challenge.challenges.length}`, color: 'text-teal-400' },
                { label: 'Points', value: `${totalPoints}/${maxPoints}`, color: 'text-yellow-400' },
                { label: 'Time Left', value: '24h', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="glass border border-border rounded-xl p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {challenge.city_fact && (
              <div className="glass border border-primary/30 rounded-xl p-3 mb-4 text-sm text-muted-foreground">
                💡 <span className="font-medium text-foreground">Local Tip:</span> {challenge.city_fact}
              </div>
            )}

            <div className="space-y-3">
              {challenge.challenges.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => toggle(i)}
                  className={`glass border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all
                    ${c.completed ? 'border-teal-500/40 bg-teal-500/5' : 'border-border hover:border-primary/40'}`}>
                  <div className="text-3xl">{c.emoji || '🎯'}</div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${c.completed ? 'line-through text-muted-foreground' : ''}`}>{c.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor(c.difficulty)}`}>{c.difficulty}</span>
                      <span className="text-xs text-yellow-500 font-bold">+{c.points}pts</span>
                    </div>
                  </div>
                  {c.completed
                    ? <CheckCircle className="w-6 h-6 text-teal-400 flex-shrink-0" />
                    : <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                </motion.div>
              ))}
            </div>

            {completed === challenge.challenges.length && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="mt-5 glass border border-yellow-500/40 rounded-2xl p-5 text-center">
                <div className="text-5xl mb-2">🏆</div>
                <h3 className="font-black text-xl text-yellow-400">City Master!</h3>
                <p className="text-sm text-muted-foreground">You conquered {challenge.city} with {totalPoints} points!</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

