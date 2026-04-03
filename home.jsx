import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Calendar, Map, Sparkles, ArrowRight, Star, TrendingUp, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const FEATURED_DESTINATIONS = [
  { name: 'Santorini', country: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80', tag: 'Trending' },
  { name: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', tag: 'Popular' },
  { name: 'Kyoto', country: 'Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80', tag: 'Cultural' },
  { name: 'Machu Picchu', country: 'Peru', img: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&q=80', tag: 'Adventure' },
  { name: 'Amalfi Coast', country: 'Italy', img: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=400&q=80', tag: 'Scenic' },
  { name: 'Maldives', country: 'Maldives', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80', tag: 'Luxury' },
];

const STATS = [
  { icon: Globe, label: 'Destinations', value: '150+' },
  { icon: Calendar, label: 'Trips Planned', value: '10K+' },
  { icon: Star, label: 'Avg Rating', value: '4.9' },
  { icon: TrendingUp, label: 'Happy Travelers', value: '50K+' },
];

export default function Home() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (user?.email) {
      base44.entities.Trip.filter({ user_email: user.email }, '-created_date', 3)
        .then(setTrips).catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen hero-bg">
      {/* Hero */}
      <div className="relative px-4 pt-12 pb-16 md:pt-20 md:pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }} />
          <div className="absolute bottom-10 right-1/4 w-56 h-56 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(200 80% 50%), transparent)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Travel Planning
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-space mb-4 leading-tight">
            Explore the World<br />
            <span className="gradient-text">with TRIO AI</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Plan perfect trips with AI, discover hidden gems, explore 3D maps, and create unforgettable adventures.
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-card/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Link to={`/trip-planner${query ? `?destination=${encodeURIComponent(query)}` : ''}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}
              >
                <span className="text-white">Plan with AI</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </motion.button>
            </Link>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/explore', label: 'Explore Places', el: <Compass className="w-4 h-4 text-primary" /> },
              { to: '/map', label: '3D Map View', el: <Map className="w-4 h-4 text-primary" /> },
              { to: '/hidden', label: 'Hidden Gems', el: <Star className="w-4 h-4 text-primary" /> },
            ].map(({ to, label, el }) => (
              <Link key={to} to={to}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border hover:border-primary/40 text-sm font-medium transition-colors">
                  {el}
                  {label}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass border border-border rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black font-space gradient-text">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent trips */}
      {trips.length > 0 && (
        <div className="px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-space">Your Recent Trips</h2>
            <Link to="/history" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trips.map(trip => (
              <Link key={trip.id} to={`/trip-planner?id=${trip.id}`}>
                <motion.div whileHover={{ y: -4 }}
                  className="glass border border-border rounded-2xl overflow-hidden">
                  <div className="h-28 bg-gradient-to-br from-primary/30 to-blue-500/20 relative">
                    {trip.cover_image && <img src={trip.cover_image} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white">
                      <p className="font-bold text-sm">{trip.title}</p>
                      <p className="text-xs opacity-80">{trip.destination}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* New Features Grid */}
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold font-space mb-6">Everything You Need to Travel Better</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { to: '/achievements', icon: '🏆', label: 'Achievements', color: 'from-yellow-500 to-orange-500', desc: 'Unlock travel badges' },
            { to: '/city-challenge', icon: '⚡', label: 'City Challenge', color: 'from-purple-500 to-pink-500', desc: '24-hour quests' },
            { to: '/mood', icon: '😊', label: 'Mood Planner', color: 'from-blue-500 to-cyan-500', desc: 'Plan by how you feel' },
            { to: '/travel-twin', icon: '💞', label: 'Travel Twin', color: 'from-pink-500 to-rose-500', desc: 'Find your match' },
            { to: '/offline-guide', icon: '📴', label: 'Offline Guide', color: 'from-teal-500 to-green-500', desc: 'No wifi needed' },
            { to: '/trip-handoff', icon: '🔗', label: 'Trip Handoff', color: 'from-indigo-500 to-blue-500', desc: 'Share with buddies' },
            { to: '/live-local', icon: '☕', label: 'Live Local', color: 'from-orange-500 to-red-500', desc: 'Skip the tourist traps' },
            { to: '/gem-radar', icon: '📡', label: 'Gem Radar', color: 'from-emerald-500 to-teal-500', desc: 'Locals-only spots' },
            { to: '/carbon', icon: '🌿', label: 'Carbon Passport', color: 'from-green-600 to-emerald-500', desc: 'Travel responsibly' },
            { to: '/slow-travel', icon: '🐢', label: 'Slow Travel', color: 'from-lime-500 to-green-500', desc: 'Stay longer, save more' },
            { to: '/packing', icon: '🧳', label: 'Packing AI', color: 'from-violet-500 to-purple-500', desc: 'Never forget a thing' },
            { to: '/scam-alerts', icon: '🛡️', label: 'Scam Alerts', color: 'from-red-500 to-orange-500', desc: 'Stay safe' },
            { to: '/health', icon: '💊', label: 'Health Guide', color: 'from-rose-500 to-red-500', desc: 'Meds & vaccinations' },
          ].map(f => (
            <Link key={f.to} to={f.to}>
              <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="glass border border-border rounded-2xl p-4 text-center hover:border-primary/40 transition-all">
                <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl bg-gradient-to-br ${f.color}`}>
                  {f.icon}
                </div>
                <p className="text-xs font-bold leading-tight">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{f.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-space">Featured Destinations</h2>
          <Link to="/explore" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURED_DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Link to={`/trip-planner?destination=${encodeURIComponent(dest.name)}`}>
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-[4/3]">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium text-white"
                      style={{ background: 'hsl(var(--primary) / 0.85)' }}>
                      {dest.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-base">{dest.name}</p>
                    <p className="text-xs opacity-80">{dest.country}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

