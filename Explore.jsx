
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Search, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import NearbyMap from '../components/maps/NearbyMap';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `List 8 popular tourist places near "${query}" with real GPS coordinates. Include a mix of attractions, restaurants, and nature spots.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          places: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                lat: { type: "number" },
                lng: { type: "number" },
                description: { type: "string" },
                type: { type: "string" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    setPlaces(result.places || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Explore Places</h1>
          <p className="text-muted-foreground mt-2">Search any location to discover nearby attractions</p>
        </div>

        <div className="flex gap-2 max-w-lg mx-auto">
          <Input
            placeholder="Search a city or place..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="text-base"
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()} className="rounded-full px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      {/* Nearby map (always shown) */}
      <Card>
        <CardContent className="p-0">
          <NearbyMap places={places} className="h-[500px]" />
        </CardContent>
      </Card>

      {/* Place cards */}
      {searched && places.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {places.map((place, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Map className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{place.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{place.description}</p>
                      {place.type && (
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {place.type}
                        </span>
                      )}
                      <a
                        href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary block mt-2 hover:underline"
                      >
                        Open in Google Maps →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
