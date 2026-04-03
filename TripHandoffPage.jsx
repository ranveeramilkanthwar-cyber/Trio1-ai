import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, CheckCheck, Users, MapPin, Calendar, Edit3, Eye, Zap, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function TripHandoffPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [handoffs, setHandoffs] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState('share');

  useEffect(() => {
    if (user?.email) {
      Promise.all([
        base44.entities.Trip.filter({ user_email: user.email }, '-created_date', 20),
        base44.entities.TripHandoff.filter({ owner_email: user.email }, '-created_date', 20),
      ]).then(([t, h]) => { setTrips(t); setHandoffs(h); }).catch(() => {});
    }
  }, [user]);

  const createHandoff = async () => {
    if (!selectedTrip) return;
    setCreating(true);
    const code = generateCode();
    const rec = await base44.entities.TripHandoff.create({
      trip_id: selectedTrip.id,
      owner_email: user.email,
      shared_with: shareEmail,
      permissions: permission,
      handoff_code: code,
      notes,
      status: 'active',
    });
    setHandoffs(prev => [rec, ...prev]);
    setSelectedTrip(null);
    setShareEmail('');
    setNotes('');
    setCreating(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const joinHandoff = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const results = await base44.entities.TripHandoff.filter({ handoff_code: joinCode.toUpperCase() });
    if (results[0]) {
      const trip = await base44.entities.Trip.filter({ id: results[0].trip_id });
      alert(`✅ Joined! Trip: "${trip[0]?.title || 'Unknown Trip'}" with ${results[0].permissions} access.`);
    } else {
      alert('❌ No handoff found with this code.');
    }
    setJoinCode('');
    setJoining(false);
  };

  const permIcon = (p) => p === 'full' ? <Zap className="w-3 h-3" /> : p === 'edit' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />;
  const permColor = (p) => p === 'full' ? 'text-amber-400 bg-amber-500/10' : p === 'edit' ? 'text-blue-400 bg-blue-500/10' : 'text-green-400 bg-green-500/10';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-space">Trip Handoff</h1>
        <p className="text-muted-foreground text-sm mt-1">Share itineraries and navigate together, seamlessly.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[{ id: 'share', label: 'Share a Trip' }, { id: 'join', label: 'Join a Trip' }, { id: 'active', label: `Active Handoffs (${handoffs.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Share tab */}
      {tab === 'share' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-bold">Select a Trip to Share</h3>
            {trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips yet. Create a trip first in Trip Planner.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {trips.map(trip => (
                  <button key={trip.id} onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                    className={`p-3 rounded-xl border text-left transition-all
                      ${selectedTrip?.id === trip.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}>
                    <p className="font-medium text-sm">{trip.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{trip.destination}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedTrip && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t border-border pt-4">
                <input value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                  placeholder="Co-traveler's email (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <div>
                  <p className="text-xs font-medium mb-2">Access Level</p>
                  <div className="flex gap-2">
                    {[{ v: 'view', l: 'View Only' }, { v: 'edit', l: 'Can Edit' }, { v: 'full', l: 'Full Access' }].map(({ v, l }) => (
                      <button key={v} onClick={() => setPermission(v)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all
                          ${permission === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Notes for co-traveler (bookings, meeting point, etc.)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                <button onClick={createHandoff} disabled={creating}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  Create Handoff Code
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Join tab */}
      {tab === 'join' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass border border-border rounded-2xl p-6 space-y-4">
          <div className="text-center mb-4">
            <p className="text-4xl mb-2">🔗</p>
            <h3 className="font-bold">Enter Handoff Code</h3>
            <p className="text-sm text-muted-foreground">Get the 6-character code from your travel partner</p>
          </div>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB1CD2"
            maxLength={6}
            className="w-full text-center text-2xl font-black px-4 py-4 rounded-xl border border-border bg-background tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button onClick={joinHandoff} disabled={joining || joinCode.length < 6}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Join Trip
          </button>
        </motion.div>
      )}

      {/* Active handoffs */}
      {tab === 'active' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {handoffs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active handoffs yet.</p>
            </div>
          ) : handoffs.map((h, i) => {
            const trip = trips.find(t => t.id === h.trip_id);
            return (
              <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass border border-border rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{trip?.title || `Trip ${h.trip_id?.slice(0, 8)}`}</p>
                    {h.shared_with && <p className="text-xs text-muted-foreground">Shared with: {h.shared_with}</p>}
                    {h.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{h.notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${permColor(h.permissions)}`}>
                    {permIcon(h.permissions)}{h.permissions}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 bg-muted/30 rounded-xl p-2.5">
                  <code className="flex-1 text-sm font-mono font-bold tracking-widest text-center">{h.handoff_code}</code>
                  <button onClick={() => copyCode(h.handoff_code)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline">
                    {copied === h.handoff_code ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === h.handoff_code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

