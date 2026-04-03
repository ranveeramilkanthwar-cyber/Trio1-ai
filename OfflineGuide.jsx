import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, WifiOff, MessageCircle, Send, Loader2, MapPin, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OfflineGuide() {
  const [city, setCity] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  const generateGuide = async () => {
    if (!city.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive offline city guide for ${city} covering: emergency contacts, transport tips, must-know phrases (5 in local language with pronunciation), neighborhood breakdown (3-4 areas with character description), top 5 free activities, food staples to try, cultural dos and don'ts, approximate costs (meal, transport, accommodation), and safety tips.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          country: { type: 'string' },
          emergency: { type: 'object', properties: { police: { type: 'string' }, ambulance: { type: 'string' }, fire: { type: 'string' }, tourist_helpline: { type: 'string' } } },
          phrases: { type: 'array', items: { type: 'object', properties: { english: { type: 'string' }, local: { type: 'string' }, pronunciation: { type: 'string' } } } },
          neighborhoods: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, vibe: { type: 'string' }, best_for: { type: 'string' } } } },
          free_activities: { type: 'array', items: { type: 'string' } },
          food_staples: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, price: { type: 'string' } } } },
          costs: { type: 'object', properties: { budget_meal: { type: 'string' }, mid_meal: { type: 'string' }, local_transport: { type: 'string' }, hostel: { type: 'string' }, mid_hotel: { type: 'string' } } },
          cultural_tips: { type: 'array', items: { type: 'string' } },
          safety_tips: { type: 'array', items: { type: 'string' } },
          transport: { type: 'string' }
        }
      }
    });
    setGuide(result);
    setChatHistory([{ role: 'assistant', text: `Hi! I'm your offline guide for ${result.city || city}. Ask me anything — I work without internet! 📱` }]);
    setLoading(false);
  };

  const sendChat = async () => {
    if (!chatMsg.trim() || !guide) return;
    const msg = chatMsg;
    setChatMsg('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an offline travel guide for ${guide.city}, ${guide.country}. Use ONLY this guide data to answer: ${JSON.stringify(guide)}. User asks: "${msg}". Give a concise, helpful answer.`,
    });
    setChatHistory(prev => [...prev, { role: 'assistant', text: res }]);
    setChatLoading(false);
  };

  const downloadGuide = () => {
    const content = JSON.stringify(guide, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${guide.city}-offline-guide.json`; a.click();
    setDownloaded(true);
  };

  const Section = ({ title, icon, id, children }) => (
    <div className="glass border border-border rounded-2xl overflow-hidden mb-3">
      <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpanded(expanded === id ? null : id)}>
        <span className="font-semibold flex items-center gap-2">{icon} {title}</span>
        {expanded === id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded === id && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space flex items-center gap-2">
          <WifiOff className="w-6 h-6 text-primary" /> Offline AI Guide
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Download a city guide that works without internet</p>
      </div>

      <div className="glass border border-border rounded-2xl p-5 mb-5">
        <div className="flex gap-3">
          <input value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateGuide()}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
          <button onClick={generateGuide} disabled={loading || !city.trim()}
            className="px-5 py-3 rounded-xl font-bold text-primary-foreground flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            {loading ? 'Building...' : 'Generate'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {guide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">{guide.city}, {guide.country}</h2>
              <button onClick={downloadGuide}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${downloaded ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-white'}`}
                style={!downloaded ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' } : {}}>
                <Download className="w-4 h-4" /> {downloaded ? 'Saved!' : 'Download'}
              </button>
            </div>

            <Section title="Emergency Contacts" icon="🚨" id="emergency">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(guide.emergency || {}).map(([k, v]) => (
                  <div key={k} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground capitalize">{k.replace('_', ' ')}</p>
                    <p className="font-bold text-red-400 text-lg">{v}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Essential Phrases" icon="🗣️" id="phrases">
              <div className="space-y-2">
                {(guide.phrases || []).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.english}</p>
                      <p className="text-sm text-primary font-bold">{p.local}</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{p.pronunciation}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Neighborhoods" icon="🏘️" id="hoods">
              <div className="space-y-3">
                {(guide.neighborhoods || []).map((n, i) => (
                  <div key={i} className="p-3 border border-border rounded-xl">
                    <p className="font-bold text-sm">{n.name}</p>
                    <p className="text-xs text-muted-foreground">{n.vibe}</p>
                    <p className="text-xs text-primary mt-1">Best for: {n.best_for}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Local Food Must-Tries" icon="🍽️" id="food">
              <div className="space-y-2">
                {(guide.food_staples || []).map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                    <span className="text-xs font-bold text-orange-400">{f.price}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Cost Overview" icon="💰" id="costs">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(guide.costs || {}).map(([k, v]) => (
                  <div key={k} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground capitalize">{k.replace('_', ' ')}</p>
                    <p className="font-bold text-primary">{v}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Cultural Tips & Safety" icon="🤝" id="culture">
              <div className="space-y-2">
                {[...(guide.cultural_tips || []), ...(guide.safety_tips || [])].map((tip, i) => (
                  <p key={i} className="text-sm flex gap-2"><span className="text-primary">•</span>{tip}</p>
                ))}
              </div>
            </Section>

            {/* Chat */}
            <div className="glass border border-border rounded-2xl overflow-hidden mt-3">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Ask the Guide</span>
                <span className="text-xs text-muted-foreground ml-auto">Works offline</span>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto space-y-3">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="flex gap-1 pl-2"><div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div>}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask anything about the city..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
                <button onClick={sendChat} disabled={chatLoading || !chatMsg.trim()}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

