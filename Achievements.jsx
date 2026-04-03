import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Share2, Lock, CheckCircle, Zap, Globe, Utensils, Train, Camera, Heart, Leaf } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ALL_BADGES = [
  { id: 'street_food_5', name: 'Street Food Explorer', icon: '🍜', desc: 'Ate street food in 5 countries', category: 'food', points: 50 },
  { id: 'overnight_train', name: 'Night Rider', icon: '🚂', desc: 'Took an overnight train', category: 'transport', points: 30 },
  { id: 'solo_trip', name: 'Solo Adventurer', icon: '🎒', desc: 'Completed a solo trip', category: 'adventure', points: 40 },
  { id: 'local_cafe', name: 'Hidden Café Hunter', icon: '☕', desc: 'Found a café with no English menu', category: 'culture', points: 25 },
  { id: 'sunrise_hike', name: 'Dawn Chaser', icon: '🌄', desc: 'Hiked to see a sunrise', category: 'adventure', points: 45 },
  { id: 'local_market', name: 'Market Maven', icon: '🛒', desc: 'Shopped at 3 local markets', category: 'culture', points: 30 },
  { id: 'temple_hopper', name: 'Temple Hopper', icon: '🛕', desc: 'Visited 10 spiritual sites', category: 'culture', points: 35 },
  { id: 'eco_traveler', name: 'Green Traveler', icon: '🌿', desc: 'Offset carbon on 3 trips', category: 'eco', points: 60 },
  { id: 'budget_master', name: 'Budget Master', icon: '💰', desc: 'Traveled 7 days under $50/day', category: 'adventure', points: 50 },
  { id: 'photo_100', name: 'Snap Maestro', icon: '📸', desc: 'Captured 100 travel moments', category: 'social', points: 20 },
  { id: 'five_continents', name: 'World Citizen', icon: '🌍', desc: 'Traveled to 5 continents', category: 'adventure', points: 100 },
  { id: 'local_language', name: 'Lingua Franca', icon: '🗣️', desc: 'Ordered food in the local language 5 times', category: 'culture', points: 35 },
];

const CATEGORY_COLORS = {
  food: 'from-orange-500 to-red-500',
  transport: 'from-blue-500 to-cyan-500',
  adventure: 'from-purple-500 to-pink-500',
  culture: 'from-yellow-500 to-orange-500',
  eco: 'from-green-500 to-teal-500',
  social: 'from-pink-500 to-rose-500',
};

export default function Achievements() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState([]);
  const [showPassport, setShowPassport] = useState(false);
  const [unlocking, setUnlocking] = useState(null);

  useEffect(() => {
    if (user?.email) {
      base44.entities.Achievement.filter({ user_email: user.email })
        .then(data => setUnlocked(data.map(a => a.badge_id)));
    }
  }, [user]);

  const totalPoints = unlocked.reduce((sum, id) => {
    const badge = ALL_BADGES.find(b => b.id === id);
    return sum + (badge?.points || 0);
  }, 0);

  const unlock = async (badge) => {
    if (unlocked.includes(badge.id) || !user?.email) return;
    setUnlocking(badge.id);
    await base44.entities.Achievement.create({
      user_email: user.email,
      badge_id: badge.id,
      badge_name: badge.name,
      badge_icon: badge.icon,
      description: badge.desc,
      category: badge.category,
      unlocked_at: new Date().toISOString(),
    });
    setUnlocked(prev => [...prev, badge.id]);
    setUnlocking(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black font-space flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" /> Travel Achievements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{unlocked.length}/{ALL_BADGES.length} badges · {totalPoints} pts</p>
        </div>
        <button onClick={() => setShowPassport(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          <Share2 className="w-4 h-4" /> My Passport
        </button>
      </div>

      {/* Progress bar */}
      <div className="glass border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Adventure Level</span>
          <span className="text-primary font-bold">{Math.round((unlocked.length / ALL_BADGES.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked.length / ALL_BADGES.length) * 100}%` }}
            transition={{ duration: 1 }} />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ALL_BADGES.map((badge, i) => {
          const isUnlocked = unlocked.includes(badge.id);
          return (
            <motion.div key={badge.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              onClick={() => !isUnlocked && unlock(badge)}
              className={`relative glass border rounded-2xl p-4 text-center cursor-pointer transition-all
                ${isUnlocked ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border opacity-60 hover:opacity-90'}`}>
              {isUnlocked && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-yellow-500" />
                </div>
              )}
              <div className={`text-4xl mb-2 ${!isUnlocked ? 'grayscale' : ''}`}>{badge.icon}</div>
              <p className="text-xs font-bold mb-1 leading-tight">{badge.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{badge.desc}</p>
              <div className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${CATEGORY_COLORS[badge.category]} text-white`}>
                +{badge.points}pts
              </div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/40">
                  {unlocking === badge.id
                    ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    : <Lock className="w-5 h-5 text-muted-foreground" />}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Passport Modal */}
      <AnimatePresence>
        {showPassport && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPassport(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(160deg, #1a2a4a 0%, #0d1f3c 50%, #1a3a2a 100%)' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-teal-400 tracking-widest uppercase font-bold">Travel Passport</p>
                    <h2 className="text-xl font-black text-white mt-1">{user?.full_name || 'Traveler'}</h2>
                  </div>
                  <div className="text-4xl">🌍</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-yellow-400">{unlocked.length}</p>
                    <p className="text-xs text-white/70">Badges</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-teal-400">{totalPoints}</p>
                    <p className="text-xs text-white/70">Points</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_BADGES.filter(b => unlocked.includes(b.id)).map(b => (
                    <span key={b.id} className="text-2xl">{b.icon}</span>
                  ))}
                  {unlocked.length === 0 && <p className="text-white/50 text-sm">Start unlocking badges!</p>}
                </div>
                <p className="text-xs text-white/40 mt-4 text-center">TRIO AI · {new Date().getFullYear()}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

