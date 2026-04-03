import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, DollarSign, Sparkles, Loader2, ChevronRight, Clock, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import TripMap3D from '@/components/TripMap3D';

const INTERESTS = ['Culture', 'Food', 'Adventure', 'Nature', 'Shopping', 'Nightlife', 'History', 'Art', 'Beaches', 'Hiking'];

export default function TripPlanner() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [savedTrip, setSavedTrip] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 'moderate',
    interests: [],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('destination');
    if (dest) setForm(f => ({ ...f, destination: dest }));
    const id = params.get('id');
    if (id) loadTrip(id);
  }, []);

  const loadTrip = async (id) => {
    const trips = await base44.entities.Trip.filter({ id });
    if (trips[0]) {
      setSavedTrip(trips[0]);
      setTrip({ itinerary: trips[0].itinerary });
      setStep(3);
    }
  };

  const toggleInterest = (interest) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest]
    }));
  };

  const generateTrip = async () => {
    setLoading(true);
    setStep(2);
    const days = form.startDate && form.endDate
      ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000))
      : 5;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed ${days}-day travel itinerary for ${form.destination} for ${form.travelers} traveler(s) with a ${form.budget} budget. Interests: ${form.interests.join(', ') || 'general sightseeing'}.

Return a JSON object with this exact structure:
{
  "title": "Trip title",
  "cover_image": "a real unsplash image URL for ${form.destination}",
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "description": "Day overview",
      "places": [
        {
          "name": "Place name",
          "lat": number (real latitude),
          "lng": number (real longitude),
          "time": "9:00 AM",
          "description": "What to do here",
          "type": "attraction|restaurant|hotel|activity"
        }
      ]
    }
  ]
}
Include 3-5 real places per day with accurate GPS coordinates for ${form.destination}. Make it practical and exciting.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          cover_image: { type: 'string' },
          itinerary: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                places: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      lat: { type: 'number' },
                      lng: { type: 'number' },
                      time: { type: 'string' },
                      description: { type: 'string' },
                      type: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    setTrip(result);
    setLoading(false);
    setStep(3);

    // Save trip
    if (user?.email) {
      const saved = await base44.entities.Trip.create({
        title: result.title || `Trip to ${form.destination}`,
        destination: form.destination,
        start_date: form.startDate,
        end_date: form.endDate,
        budget: form.budget,
        travelers: form.travelers,
        interests: form.interests.join(', '),
        itinerary: result.itinerary,
        cover_image: result.cover_image || '',
        user_email: user.email,
        status: 'planning',
      });
      setSavedTrip(saved);
      await base44.entities.UserHistory.create({
        user_email: user.email,
        action: 'trip_planned',
        details: `Planned trip to ${form.destination}`,
        trip_id: saved.id,
        destination: form.destination,
      });
    }
  };

  const typeColor = (type) => {
    const colors = { attraction: 'bg-blue-500/20 text-blue-400', restaurant: 'bg-orange-500/20 text-orange-400', hotel: 'bg-purple-500/20 text-purple-400', activity: 'bg-green-500/20 text-green-400' };
    return colors[type] || 'bg-primary/20 text-primary';
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black font-space mb-1">AI Trip Planner</h1>
        <p className="text-muted-foreground text-sm">Let AI craft your perfect itinerary</p>
      </div>

      {/* Step 1: Form */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-border rounded-2xl p-6 max-w-2xl">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Destination</label>
              <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                placeholder="Paris, Bali, Tokyo..." className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Travelers</label>
                <select value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: +e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Budget</label>
                <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                  <option value="budget">Budget</option>
                  <option value="moderate">Moderate</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button key={interest} onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.interests.includes(interest) ? 'text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                    style={form.interests.includes(interest) ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' } : {}}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateTrip} disabled={!form.destination}
              className="w-full py-4 rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
              <Sparkles className="w-5 h-5" />
              Generate AI Itinerary
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Loading */}
      {step === 2 && loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">AI is crafting your trip...</p>
            <p className="text-muted-foreground text-sm mt-1">Building day-by-day itinerary for {form.destination}</p>
          </div>
        </motion.div>
      )}

      {/* Step 3: Results */}
      {step === 3 && trip && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">{savedTrip?.title || `Trip to ${form.destination}`}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />{form.destination || savedTrip?.destination}
                <span>•</span>
                <Star className="w-3 h-3 text-yellow-500" />{trip.itinerary?.length || 0} days
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep(1); setTrip(null); setSavedTrip(null); }}
                className="px-4 py-2 rounded-xl text-sm border border-border hover:bg-muted transition-colors">
                New Trip
              </button>
              <button onClick={() => setShowMap(!showMap)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                <MapPin className="w-4 h-4" />
                {showMap ? 'Hide Map' : 'Show 3D Map'}
              </button>
            </div>
          </div>

          {/* 3D Map */}
          <AnimatePresence>
            {showMap && trip.itinerary && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-6">
                {/* Day selector */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  <button onClick={() => setSelectedDay(0)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedDay === 0 ? 'text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    style={selectedDay === 0 ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' } : {}}>
                    All Days
                  </button>
                  {trip.itinerary.map((day, i) => (
                    <button key={i} onClick={() => setSelectedDay(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedDay === i + 1 ? 'text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                      style={selectedDay === i + 1 ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' } : {}}>
                      Day {day.day}
                    </button>
                  ))}
                </div>
                <TripMap3D
                  itinerary={trip.itinerary}
                  selectedDay={selectedDay}
                  destination={form.destination || savedTrip?.destination}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Days */}
          <div className="space-y-4">
            {trip.itinerary?.map((day, di) => (
              <motion.div key={di} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: di * 0.07 }}
                className="glass border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{day.title}</h3>
                    <p className="text-xs text-muted-foreground">{day.description}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {day.places?.map((place, pi) => (
                    <div key={pi} className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        {pi < day.places.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 my-1" style={{ minHeight: 20 }} />}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{place.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor(place.type)}`}>{place.type}</span>
                          {place.time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />{place.time}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{place.description}</p>
                        {place.lat && place.lng && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />View on Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

