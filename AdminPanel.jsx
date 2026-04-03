import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Map, Search, LogOut, Trash2, RefreshCw, BarChart2, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const ADMIN_USER = 'ranveer';
const ADMIN_PASS = 'ranveer';

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const login = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthed(true);
      setError('');
      loadData();
    } else {
      setError('Invalid credentials');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [u, t] = await Promise.all([
      base44.entities.User.list('-created_date', 100),
      base44.entities.Trip.list('-created_date', 200),
    ]);
    setUsers(u);
    setTrips(t);
    setLoading(false);
  };

  const deleteTrip = async (id) => {
    await base44.entities.Trip.delete(id);
    setTrips(t => t.filter(trip => trip.id !== id));
  };

  const filteredTrips = trips.filter(t =>
    t.destination?.toLowerCase().includes(search.toLowerCase()) ||
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const userTrips = selectedUser ? trips.filter(t => t.user_email === selectedUser.email) : [];

  const stats = {
    totalUsers: users.length,
    totalTrips: trips.length,
    destinations: [...new Set(trips.map(t => t.destination))].length,
    avgTrips: users.length ? (trips.length / users.length).toFixed(1) : 0,
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass border border-border rounded-2xl p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black font-space">Admin Access</h1>
            <p className="text-sm text-muted-foreground">TRIO AI Control Panel</p>
          </div>
          <div className="space-y-3">
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button onClick={login}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              Access Admin Panel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'trips', label: `Trips (${trips.length})`, icon: Map },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black font-space">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Logged in as ranveer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-border hover:bg-muted transition-colors">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <button onClick={() => setAuthed(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-destructive/40 text-destructive hover:bg-destructive/10">
            <LogOut className="w-3 h-3" />Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map(({ id, label, icon: TabIcon }) => (
        <button key={id} onClick={() => setTab(id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
            ${tab === id ? 'border-amber-500 text-amber-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <TabIcon className="w-4 h-4" />{label}
        </button>
        ))}
      </div>

      {/* Search */}
      {tab !== 'overview' && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'users' ? 'Search users...' : 'Search trips...'}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#4facfe' },
              { label: 'Total Trips', value: stats.totalTrips, icon: Map, color: '#00d2be' },
              { label: 'Destinations', value: stats.destinations, icon: MapPin, color: '#f093fb' },
              { label: 'Avg Trips/User', value: stats.avgTrips, icon: BarChart2, color: '#f5a623' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-3xl font-black font-space" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="glass border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-4">Recent Trips</h3>
            <div className="space-y-3">
              {trips.slice(0, 8).map(trip => (
                <div key={trip.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {trip.destination?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{trip.title}</p>
                    <p className="text-xs text-muted-foreground">{trip.user_email} • {trip.destination}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {trip.created_date && format(new Date(trip.created_date), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass border border-border rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-border text-xs font-medium text-muted-foreground">
              {filteredUsers.length} users found
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {filteredUsers.map(u => {
                const uTrips = trips.filter(t => t.user_email === u.email);
                return (
                  <button key={u.id} onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left
                      ${selectedUser?.id === u.id ? 'bg-amber-500/10' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500 flex-shrink-0">
                      {u.full_name?.[0] || u.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{uTrips.length} trips</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedUser && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-500">
                  {selectedUser.full_name?.[0] || selectedUser.email?.[0]}
                </div>
                <div>
                  <p className="font-bold">{selectedUser.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Trips</p>
                  <p className="font-bold text-amber-500">{userTrips.length}</p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-xs font-medium">{selectedUser.created_date && format(new Date(selectedUser.created_date), 'MMM yyyy')}</p>
                </div>
              </div>
              <p className="text-xs font-medium mb-2">User's Trips</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {userTrips.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No trips yet</p>
                ) : userTrips.map(trip => (
                  <div key={trip.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{trip.title}</p>
                      <p className="text-xs text-muted-foreground">{trip.destination}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Trips */}
      {tab === 'trips' && (
        <div className="glass border border-border rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-border text-xs font-medium text-muted-foreground">
            {filteredTrips.length} trips found
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {trip.destination?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{trip.title}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.destination}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{trip.travelers} pax</span>
                    {trip.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(trip.start_date), 'MMM d, yyyy')}</span>}
                    <span className="text-primary">{trip.user_email}</span>
                  </div>
                </div>
                <button onClick={() => deleteTrip(trip.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

