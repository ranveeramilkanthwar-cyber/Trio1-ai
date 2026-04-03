import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Link, Check, Copy, Users, MapPin, Plus, Loader2, QrCode, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function TripHandoff() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [permission, setPermission] = useState('view');
  const [email, setEmail] = useState('');
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('share');

  useEffect(() => {
    if (user?.email) {
      base44.entities.Trip.filter({ user_email: user.email }, '-created_date', 20).then(setTrips);
      base44.entities.TripHandoff.filter({ owner_email: user.email }).then(setHandoffs);
    }
  }, [user]);

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createHandoff = async () => {
    if (!selectedTrip || !user?.email) return;
    setLoading(true);
    const code = generateCode();
    const trip = trips.find(t => t.id === selectedTrip);
    const h = await base44.entities.TripHandoff.create({
      trip_id: selectedTrip,
      owner_email: user.email,
      shared_with: email || '',
      permissions: permission,
      handoff_code: code,
      status: 'pending',
      notes: `Trip to ${trip?.destination}`,
    });
    setHandoffs(prev => [h, ...prev]);
    setLoading(false);
    setEmail('');
  };

  const copy = (code) => {
    navigator.clipboard.writeText(`Join my trip on TRIO AI! Code: ${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinTrip = async () => {
    if (!joinCode.trim()) return;
    const found = await base44.entities.TripHandoff.filter({ handoff_code: joinCode.toUpperCase() });
    if (found[0]) {
      await base44.entities.TripHandoff.update(found[0].id, { shared_with: user?.email, status: 'accepted' });
      alert('Trip joined! Check your Trip Planner.');
    } else {
      alert('Invalid code. Please check and try again.');
    }
  };

  const permColors = { view: 'text-blue-400 bg-blue-500/10', edit: 'text-yellow-400 bg-yellow-500/10', full: 'text-green-400 bg-green-500/10' };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Share2 className="w-7 h-7 text-primary" /> Trip Handoff
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Share itineraries with travel buddies instantly</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
        {['share', 'join', 'active'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${tab === t ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
            {t === 'active' ? `Active (${handoffs.length})` : t === 'share' ? '🔗 Share' : '🔑 Join'}
          </button>
        ))}
      </div>

      {tab === 'share' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Trip</label>
              <select value={selectedTrip || ''} onChange={e => setSelectedTrip(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">Choose a trip...</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.title} — {t.destination}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Co-traveler email (optional)</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="friend@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Permission Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['view', 'edit', 'full'].map(p => (
                  <button key={p} onClick={() => setPermission(p)}
                    className={`py-2.5 rounded-xl text-sm font-medium capitalize border transition-all
                      ${permission === p ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    {p === 'view' ? '👁 View' : p === 'edit' ? '✏️ Edit' : '⚡ Full'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={createHandoff} disabled={!selectedTrip || loading}
              className="w-full py-3 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              Generate Handoff Code
            </button>
          </div>

          {handoffs.length > 0 && (
            <div className="glass border border-border rounded-2xl overflow-hidden">
              <div className="p-3 border-b border-border text-xs font-medium text-muted-foreground">Recent codes</div>
              {handoffs.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-0">
                  <div className="font-mono text-xl font-black text-primary">{h.handoff_code}</div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{h.notes}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${permColors[h.permissions]}`}>{h.permissions}</span>
                  </div>
                  <button onClick={() => copy(h.handoff_code)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {tab === 'join' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass border border-border rounded-2xl p-6 text-center space-y-4">
          <div className="text-6xl">🔑</div>
          <h3 className="font-bold text-lg">Enter Handoff Code</h3>
          <p className="text-sm text-muted-foreground">Ask your travel buddy to share their 6-digit code</p>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC123" maxLength={6}
            className="w-48 mx-auto block px-4 py-3 rounded-xl border border-border bg-background text-center text-2xl font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button onClick={joinTrip} disabled={joinCode.length < 6}
            className="px-8 py-3 rounded-xl font-bold text-primary-foreground disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            Join Trip
          </button>
        </motion.div>
      )}

      {tab === 'active' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {handoffs.length === 0
            ? <div className="text-center py-12 text-muted-foreground">No active handoffs yet</div>
            : <div className="space-y-3">
              {handoffs.map((h, i) => (
                <div key={i} className="glass border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className="font-mono text-lg font-black text-primary">{h.handoff_code}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{h.notes}</p>
                    <p className="text-xs text-muted-foreground">{h.shared_with || 'No email set'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${h.status === 'accepted' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>}
        </motion.div>
      )}
    </div>
  );
}

