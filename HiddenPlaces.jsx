import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Star, Tag, Search, Plus, Eye, EyeOff, Navigation, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const CATEGORY_COLORS = {
  nature: { bg: 'bg-green-500/20', text: 'text-green-400', emoji: '🌿' },
  cultural: { bg: 'bg-purple-500/20', text: 'text-purple-400', emoji: '🏛️' },
  adventure: { bg: 'bg-orange-500/20', text: 'text-orange-400', emoji: '⚡' },
  food: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', emoji: '🍜' },
  historic: { bg: 'bg-amber-500/20', text: 'text-amber-400', emoji: '🏺' },
  spiritual: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', emoji: '🕌' },
};

const SAMPLE_HIDDEN = [
  { id: 's1', name: 'Secret Rooftop Garden', description: 'Hidden urban oasis on a 1920s building roof with 360° city views. Only known to locals.', lat: 48.8606, lng: 2.3376, city: 'Paris', country: 'France', category: 'nature', local_contact_name: 'Jacques Moreau', local_contact_phone: '+33 6 12 34 56 78', tags: 'rooftop,garden,views,secret', rating: 4.9 },
  { id: 's2', name: 'Underground Jazz Cave', description: 'A 200-year-old wine cellar converted into an intimate jazz venue. No sign on the door.', lat: 48.852, lng: 2.345, city: 'Paris', country: 'France', category: 'cultural', local_contact_name: 'Marie Dubois', local_contact_phone: '+33 6 98 76 54 32', tags: 'jazz,music,underground,nightlife', rating: 4.8 },
  { id: 's3', name: 'Sacred Mountain Spring', description: 'Ancient healing spring hidden deep in rice terraces. Used by local healers for centuries.', lat: -8.415, lng: 115.188, city: 'Bali', country: 'Indonesia', category: 'spiritual', local_contact_name: 'Wayan Sukma', local_contact_phone: '+62 819 123 4567', tags: 'spiritual,healing,water,ancient', rating: 5.0 },
  { id: 's4', name: 'Lost Waterfall Trail', description: 'Unmarked jungle trail leading to a spectacular triple waterfall. Only accessible with local guide.', lat: -8.385, lng: 115.163, city: 'Bali', country: 'Indonesia', category: 'adventure', local_contact_name: 'Nyoman Guide', local_contact_phone: '+62 821 987 6543', tags: 'waterfall,jungle,hiking,adventure', rating: 4.9 },
  { id: 's5', name: 'Night Market Alley', description: 'Hidden alley with the best street food in Tokyo. Only open midnight to 4am. No tourists.', lat: 35.695, lng: 139.700, city: 'Tokyo', country: 'Japan', category: 'food', local_contact_name: 'Kenji Tanaka', local_contact_phone: '+81 90 1234 5678', tags: 'street food,night market,local,authentic', rating: 4.7 },
  { id: 's6', name: 'Ancient Stone Observatory', description: 'Pre-Incan astronomical site hidden in cloud forest. Not on any map or tourist trail.', lat: -13.165, lng: -72.535, city: 'Cusco', country: 'Peru', category: 'historic', local_contact_name: 'Carlos Rivera', local_contact_phone: '+51 984 123 456', tags: 'inca,astronomy,ruins,hidden', rating: 4.8 },
];

export default function HiddenPlaces() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', city: '', country: '', category: 'nature', local_contact_name: '', local_contact_phone: '', tags: '', lat: '', lng: '' });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const db = await base44.entities.HiddenLocation.list('-created_date', 50);
    setLocations([...SAMPLE_HIDDEN, ...db]);
  };

  const togglePhone = (id) => setRevealedPhone(r => ({ ...r, [id]: !r[id] }));

  const submit = async () => {
    setLoading(true);
    await base44.entities.HiddenLocation.create({
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      rating: 4.5,
    });
    setShowAdd(false);
    setForm({ name: '', description: '', city: '', country: '', category: 'nature', local_contact_name: '', local_contact_phone: '', tags: '', lat: '', lng: '' });
    await loadLocations();
    setLoading(false);
  };

  const filtered = locations.filter(l =>
    (category === 'all' || l.category === category) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase()) ||
      l.country?.toLowerCase().includes(search.toLowerCase()))
  );

  const CATS = ['all', 'nature', 'cultural', 'adventure', 'food', 'historic', 'spiritual'];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-space mb-1">Hidden Places</h1>
          <p className="text-muted-foreground text-sm">Secret spots only locals know about</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
          <Plus className="w-4 h-4" />Add Secret
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-5 glass border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Add Hidden Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name', placeholder: 'Location name', label: 'Name' },
                { key: 'city', placeholder: 'City', label: 'City' },
                { key: 'country', placeholder: 'Country', label: 'Country' },
                { key: 'lat', placeholder: '48.8566', label: 'Latitude' },
                { key: 'lng', placeholder: '2.3522', label: 'Longitude' },
                { key: 'local_contact_name', placeholder: 'Local contact name', label: 'Contact Name' },
                { key: 'local_contact_phone', placeholder: '+1 234 567 8900', label: 'Contact Phone' },
                { key: 'tags', placeholder: 'hidden,secret,local', label: 'Tags (comma separated)' },
              ].map(({ key, placeholder, label }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this hidden gem..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 h-20 resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {['nature', 'cultural', 'adventure', 'food', 'historic', 'spiritual'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={submit} disabled={!form.name || loading}
                className="px-5 py-2 rounded-xl text-sm font-medium text-primary-foreground disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                {loading ? 'Saving...' : 'Save Location'}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-sm border border-border hover:bg-muted">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hidden places..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATS.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize
              ${category === c ? 'text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            style={category === c ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' } : {}}>
            {CATEGORY_COLORS[c]?.emoji} {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((loc, i) => {
          const cat = CATEGORY_COLORS[loc.category] || { bg: 'bg-muted', text: 'text-muted-foreground', emoji: '📍' };
          const tags = loc.tags ? loc.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
          return (
            <motion.div key={loc.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat.bg}`}>
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-0.5">{loc.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {[loc.city, loc.country].filter(Boolean).join(', ')}
                  </div>
                </div>
                {loc.rating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span className="font-medium">{loc.rating}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{loc.description}</p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.slice(0, 4).map(tag => (
                    <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Local contact */}
              {(loc.local_contact_name || loc.local_contact_phone) && (
                <div className="border border-border rounded-xl p-3 mb-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Phone className="w-3 h-3 text-primary" />
                      Local Contact: {loc.local_contact_name}
                    </div>
                    <button onClick={() => togglePhone(loc.id || i)}
                      className="text-xs text-primary hover:underline flex items-center gap-1">
                      {revealedPhone[loc.id || i] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {revealedPhone[loc.id || i] ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  {revealedPhone[loc.id || i] && (
                    <a href={`tel:${loc.local_contact_phone}`} className="text-xs text-primary font-mono hover:underline">
                      {loc.local_contact_phone}
                    </a>
                  )}
                </div>
              )}

              {/* Google Maps links */}
              {loc.lat && loc.lng && (
                <div className="flex gap-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-primary-foreground"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                    <Navigation className="w-3 h-3" />
                    Open in Maps
                  </a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted transition-colors flex items-center gap-1">
                    <MapPin className="w-3 h-3" />Directions
                  </a>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

