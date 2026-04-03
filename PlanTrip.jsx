import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Loader2, Calendar, Users, Wallet, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import TripItinerary from '../components/trip/TripItinerary';

export default function PlanTrip() {
  const [form, setForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    budget: 'moderate',
    travelers: 1,
    interests: ''
  });
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);

  const handlePlan = async () => {
    if (!form.destination) return;
    setLoading(true);

    const days = form.start_date && form.end_date
      ? Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60 * 24)) + 1
      : 3;

    const prompt = `Create a detailed ${days}-day travel itinerary for ${form.destination}. 
Budget level: ${form.budget}. Travelers: ${form.travelers}. 
Interests: ${form.interests || 'general sightseeing'}.
For each day, provide 3-4 places to visit with real GPS coordinates (latitude, longitude), visit time, and short description.
Include a mix of popular attractions and hidden gems.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          cover_image_search: { type: "string" },
          itinerary: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                title: { type: "string" },
                description: { type: "string" },
                places: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      lat: { type: "number" },
                      lng: { type: "number" },
                      time: { type: "string" },
                      description: { type: "string" },
                      type: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const newTrip = await base44.entities.Trip.create({
      title: result.title || `${form.destination} Trip`,
      destination: form.destination,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget,
      travelers: form.travelers,
      interests: form.interests,
      itinerary: result.itinerary || [],
      status: 'planning'
    });

    setTrip({ ...newTrip, itinerary: result.itinerary || [] });
    setLoading(false);
  };

  if (trip) {
    return <TripItinerary trip={trip} onBack={() => setTrip(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h1 className="text-3xl font-heading font-bold">Plan Your Trip</h1>
          <p className="text-muted-foreground mt-2">Tell us where you want to go and we'll create the perfect itinerary</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Compass className="w-4 h-4 text-primary" /> Destination</Label>
              <Input
                placeholder="e.g. Paris, Tokyo, Bali..."
                value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> End Date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Budget</Label>
                <Select value={form.budget} onValueChange={v => setForm({ ...form, budget: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget-Friendly</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Travelers</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.travelers}
                  onChange={e => setForm({ ...form, travelers: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Interests</Label>
              <Textarea
                placeholder="e.g. food, history, nightlife, nature, photography..."
                value={form.interests}
                onChange={e => setForm({ ...form, interests: e.target.value })}
                className="h-20"
              />
            </div>

            <Button
              onClick={handlePlan}
              disabled={!form.destination || loading}
              className="w-full rounded-full h-12 text-base"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Trip Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

