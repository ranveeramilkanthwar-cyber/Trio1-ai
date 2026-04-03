import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, MapPin, Calendar, Trash2, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';

export default function UserHistory() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('trips');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [t, h] = await Promise.all([
      base44.entities.Trip.filter({ user_email: user.email }, '-created_date', 50),
      base44.entities.UserHistory.filter({ user_email: user.email }, '-created_date', 50),
    ]);
    setTrips(t);
    setHistory(h);
    setLoading(false);
  };

  const deleteTrip = async (id) => {
    await base44.entities.Trip.delete(id);
    setTrips(t => t.filter(trip => trip.id !== id));
  };

  const budgetColor = { budget: 'text-green-400', moderate: 'text-yellow-400', luxury: 'text-purple-400' };

  const actionLabel = (action) => ({
    trip_planned: '🗺️ Planned a trip',
    trip_updated: '✏️ Updated trip',
    place_explored: '🔍 Explored place',
  })[action] || action;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <History className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-space">My History</h1>
          <p className="text-muted-foreground text-sm">Your private travel records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {['trips', 'activity'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
              ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'trips' ? `My Trips (${trips.length})` : `Activity (${history.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : tab === 'trips' ? (
        trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-medium mb-2">No trips yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start planning your first adventure!</p>
            <Link to="/trip-planner">
              <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                Plan a Trip
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trips.map((trip, i) => (
              <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass border border-border rounded-2xl overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/30 to-blue-500/20 relative">
                  {trip.cover_image && <img src={trip.cover_image} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white">
                    <p className="font-bold text-sm">{trip.title}</p>
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <MapPin className="w-3 h-3" />{trip.destination}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-black/40 backdrop-blur capitalize ${budgetColor[trip.budget]}`}>
                      {trip.budget}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {trip.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(trip.start_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    <span>• {trip.itinerary?.length || 0} days</span>
                    <span>• {trip.travelers} pax</span>
                  </div>
                  {trip.interests && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {trip.interests.split(',').slice(0, 3).map(int => (
                        <span key={int} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{int.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link to={`/trip-planner?id=${trip.id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-primary-foreground"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                        <Eye className="w-3 h-3" />View Trip
                      </button>
                    </Link>
                    <button onClick={() => deleteTrip(trip.id)}
                      className="px-3 py-2 rounded-xl text-xs border border-border hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        history.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                  {item.action === 'trip_planned' ? '🗺️' : '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{actionLabel(item.action)}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.created_date && format(new Date(item.created_date), 'MMM d')}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

