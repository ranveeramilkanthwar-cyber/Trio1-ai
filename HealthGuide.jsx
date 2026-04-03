import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, AlertTriangle, CheckCircle, MapPin, Pill, Syringe, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HealthGuide() {
  const [destination, setDestination] = useState('');
  const [medications, setMedications] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState('vaccines');

  const generate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive health and medication travel guide for traveling to ${destination}.
${medications ? `The traveler takes these medications: ${medications}` : ''}

Include:
1. Required and recommended vaccinations
2. Medication restrictions or bans in ${destination} (be specific and accurate)
3. Common health risks in ${destination}
4. Nearest hospital types/quality
5. Emergency health contacts
6. Health insurance tips
7. Water/food safety
8. Local pharmacy tips
${medications ? `9. Specific notes about these medications: ${medications} - are they legal, require a prescription, need a doctor's letter, etc.` : ''}`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          destination: { type: 'string' },
          country: { type: 'string' },
          risk_level: { type: 'string' },
          vaccines: {
            type: 'array',
            items: { type: 'object', properties: { name: { type: 'string' }, required: { type: 'boolean' }, notes: { type: 'string' } } }
          },
          medication_restrictions: {
            type: 'array',
            items: { type: 'object', properties: { medication: { type: 'string' }, status: { type: 'string' }, notes: { type: 'string' } } }
          },
          your_medications: {
            type: 'array',
            items: { type: 'object', properties: { name: { type: 'string' }, status: { type: 'string' }, advice: { type: 'string' } } }
          },
          health_risks: { type: 'array', items: { type: 'string' } },
          emergency_contacts: {
            type: 'object',
            properties: { ambulance: { type: 'string' }, police: { type: 'string' }, tourist_medical: { type: 'string' } }
          },
          hospital_quality: { type: 'string' },
          water_safety: { type: 'string' },
          food_safety: { type: 'string' },
          pharmacy_tips: { type: 'string' },
          insurance_tip: { type: 'string' }
        }
      }
    });
    setGuide(result);
    setLoading(false);
  };

  const riskColors = {
    low: 'text-green-400 bg-green-500/10 border-green-500/30',
    moderate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    very_high: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const statusColors = {
    banned: 'text-red-400 bg-red-500/10',
    restricted: 'text-orange-400 bg-orange-500/10',
    requires_prescription: 'text-yellow-400 bg-yellow-500/10',
    allowed: 'text-green-400 bg-green-500/10',
    bring_letter: 'text-blue-400 bg-blue-500/10',
  };

  const Section = ({ id, title, icon, children }) => (
    <div className="glass border border-border rounded-2xl overflow-hidden mb-3">
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(expanded === id ? null : id)}>
        <span className="text-lg">{icon}</span>
        <span className="font-semibold flex-1">{title}</span>
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
          <Heart className="w-7 h-7 text-red-500" /> Health Travel Guide
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Vaccinations, medication checks & health safety for your destination</p>
      </div>

      <div className="glass border border-border rounded-2xl p-5 space-y-4 mb-5">
        <div>
          <label className="text-sm font-medium mb-2 block">🌍 Destination country</label>
          <input value={destination} onChange={e => setDestination(e.target.value)}
            placeholder="e.g. Indonesia, Thailand, India..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">💊 Your medications (optional)</label>
          <textarea value={medications} onChange={e => setMedications(e.target.value)}
            placeholder="e.g. Adderall, Tramadol, Xanax... (separate with commas)"
            rows={2} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <p className="text-xs text-muted-foreground mt-1">⚠️ Always verify with official sources before travel. This is informational only.</p>
        </div>
        <button onClick={generate} disabled={loading || !destination.trim()}
          className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-3 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ef4444, #ec4899)' }}>
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking health data...</> : <><Heart className="w-5 h-5" /> Get Health Guide</>}
        </button>
      </div>

      <AnimatePresence>
        {guide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header card */}
            <div className="glass border border-border rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-black text-lg">{guide.destination || destination}</h2>
                <p className="text-xs text-muted-foreground">{guide.country}</p>
              </div>
              {guide.risk_level && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${riskColors[guide.risk_level.toLowerCase().replace(' ', '_')] || 'text-muted-foreground'}`}>
                  {guide.risk_level} risk
                </span>
              )}
            </div>

            {/* Emergency contacts */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
              <p className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> Emergency Numbers</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(guide.emergency_contacts || {}).map(([k, v]) => (
                  <div key={k} className="bg-red-500/10 rounded-xl p-2 text-center">
                    <p className="text-xs text-muted-foreground capitalize">{k.replace('_', ' ')}</p>
                    <p className="font-black text-red-400">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <Section id="vaccines" title="Vaccinations" icon="💉">
              <div className="space-y-2">
                {(guide.vaccines || []).map((v, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${v.required ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/50'}`}>
                    <Syringe className={`w-4 h-4 mt-0.5 flex-shrink-0 ${v.required ? 'text-red-400' : 'text-yellow-400'}`} />
                    <div>
                      <p className="text-sm font-medium">{v.name}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${v.required ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {v.required ? 'Required' : 'Recommended'}
                        </span>
                      </p>
                      {v.notes && <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {guide.your_medications?.length > 0 && (
              <Section id="your_meds" title="Your Medications Check" icon="💊">
                <div className="space-y-2">
                  {guide.your_medications.map((m, i) => (
                    <div key={i} className="p-3 border border-border rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{m.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status?.toLowerCase().replace(' ', '_')] || 'bg-muted'}`}>{m.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.advice}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section id="restrictions" title="General Medication Restrictions" icon="🚫">
              <div className="space-y-2">
                {(guide.medication_restrictions || []).map((m, i) => (
                  <div key={i} className="p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{m.medication}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[m.status?.toLowerCase().replace(' ', '_')] || 'bg-muted'}`}>{m.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.notes}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="risks" title="Health Risks & Safety" icon="⚠️">
              <div className="space-y-2">
                {(guide.health_risks || []).map((r, i) => (
                  <p key={i} className="text-sm flex gap-2"><AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />{r}</p>
                ))}
                {guide.water_safety && <p className="text-sm flex gap-2 mt-2"><span className="text-blue-400">💧</span>{guide.water_safety}</p>}
                {guide.food_safety && <p className="text-sm flex gap-2"><span>🍴</span>{guide.food_safety}</p>}
              </div>
            </Section>

            <Section id="practical" title="Hospitals & Pharmacy Tips" icon="🏥">
              <div className="space-y-2">
                {guide.hospital_quality && <p className="text-sm"><span className="font-medium">Hospital quality:</span> {guide.hospital_quality}</p>}
                {guide.pharmacy_tips && <p className="text-sm mt-2">{guide.pharmacy_tips}</p>}
                {guide.insurance_tip && (
                  <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
                    🛡️ {guide.insurance_tip}
                  </div>
                )}
              </div>
            </Section>

            <button onClick={() => setGuide(null)} className="w-full mt-2 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Check Another Destination
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

