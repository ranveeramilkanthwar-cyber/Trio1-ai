import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Search, ThumbsUp, MapPin, Clock, Shield, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const SCAM_TYPES = ['taxi', 'pickpocket', 'overcharge', 'fake_police', 'distraction', 'other'];
const SEVERITY_STYLES = {
  low: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function ScamAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ city: '', country: '', location_detail: '', scam_type: 'taxi', description: '', severity: 'medium' });

  useEffect(() => {
    base44.entities.ScamAlert.list('-created_date', 50).then(setAlerts);
  }, []);

  const submit = async () => {
    if (!form.city || !form.description) return;
    setLoading(true);
    const a = await base44.entities.ScamAlert.create({ ...form, reported_by: user?.email || 'anonymous', upvotes: 0, verified: false });
    setAlerts(prev => [a, ...prev]);
    setForm({ city: '', country: '', location_detail: '', scam_type: 'taxi', description: '', severity: 'medium' });
    setShowForm(false);
    setLoading(false);
  };

  const upvote = async (alert) => {
    const updated = await base44.entities.ScamAlert.update(alert.id, { upvotes: (alert.upvotes || 0) + 1 });
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, upvotes: a.upvotes + 1 } : a));
  };

  const filtered = alerts.filter(a =>
    a.city?.toLowerCase().includes(search.toLowerCase()) ||
    a.country?.toLowerCase().includes(search.toLowerCase()) ||
    a.scam_type?.toLowerCase().includes(search.toLowerCase())
  );

  const SCAM_ICONS = { taxi: '🚕', pickpocket: '👜', overcharge: '💸', fake_police: '👮', distraction: '👀', other: '⚠️' };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <Shield className="w-7 h-7 text-red-500" /> Scam Alerts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Crowdsourced, real-time warnings from travelers worldwide</p>
      </div>

      {/* Search + Report */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by city, country, type..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-3 rounded-xl font-bold text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
          <Plus className="w-4 h-4" /> Report
        </button>
      </div>

      {/* Report form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-red-500/30 rounded-2xl p-5 mb-5 space-y-3">
          <h3 className="font-bold text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Report a Scam</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
            <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Country"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
          </div>
          <input value={form.location_detail} onChange={e => setForm(f => ({ ...f, location_detail: e.target.value }))}
            placeholder="Specific location (e.g. near Airport Gate 3, Old Town square)"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.scam_type} onChange={e => setForm(f => ({ ...f, scam_type: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none">
              {SCAM_TYPES.map(t => <option key={t} value={t}>{SCAM_ICONS[t]} {t.replace('_', ' ')}</option>)}
            </select>
            <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none">
              <option value="low">Low severity</option>
              <option value="medium">Medium severity</option>
              <option value="high">High severity</option>
            </select>
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the scam in detail — what happened, how to avoid it..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30" />
          <button onClick={submit} disabled={loading || !form.city || !form.description}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Submit Alert
          </button>
        </motion.div>
      )}

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground"><Shield className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No alerts yet for this location.</p></div>}
        {filtered.map((a, i) => {
          const s = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.medium;
          return (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl p-4 border ${s.bg} ${s.border}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SCAM_ICONS[a.scam_type] || '⚠️'}</span>
                      <span className={`text-xs font-bold uppercase ${s.text}`}>{a.scam_type?.replace('_', ' ')}</span>
                      {a.verified && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">✓ Verified</span>}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : 'Recently'}
                    </span>
                  </div>
                  <p className="font-bold text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{a.city}, {a.country}
                    {a.location_detail && <span className="text-muted-foreground font-normal">· {a.location_detail}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  <button onClick={() => upvote(a)} className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({a.upvotes || 0})
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

