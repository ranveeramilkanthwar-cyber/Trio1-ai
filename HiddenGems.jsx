import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Loader2, Phone, ExternalLink, Star, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HiddenLocationMap from '../components/maps/HiddenLocationMap';

const categoryEmojis = {
  nature: '🌿', cultural: '🎭', adventure: '🧗', food: '🍜', historic: '🏛️', spiritual: '🕌'
};

export default function HiddenGems() {
  const [searchCity, setSearchCity] = useState('');
  const [aiLocations, setAiLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: savedLocations = [] } = useQuery({
    queryKey: ['hidden-locations'],
    queryFn: () => base44.entities.HiddenLocation.list('-created_date', 50),
  });

  const handleDiscover = async () => {
    if (!searchCity.trim()) return;
    setLoading(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 6 hidden gem locations near "${searchCity}" that tourists usually don't know about. Include real GPS coordinates, local contact info (a local guide or contact person name and phone number), and categorize each as: nature, cultural, adventure, food, historic, or spiritual. Include interesting secret spots.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          locations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                lat: { type: "number" },
                lng: { type: "number" },
                city: { type: "string" },
                country: { type: "string" },
                category: { type: "string" },
                local_contact_name: { type: "string" },
                local_contact_phone: { type: "string" },
                tags: { type: "string" },
                rating: { type: "number" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    const locations = result.locations || [];
    setAiLocations(locations);

    // Save to database
    for (const loc of locations) {
      await base44.entities.HiddenLocation.create(loc);
    }

    setLoading(false);
  };

  const displayLocations = aiLocations.length > 0 ? aiLocations : savedLocations;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Hidden Gems
          </div>
          <h1 className="text-3xl font-heading font-bold">Discover Secret Locations</h1>
          <p className="text-muted-foreground mt-2">Uncover hidden spots with local contacts & Google Maps links</p>
        </div>

        <div className="flex gap-2 max-w-lg mx-auto">
          <Input
            placeholder="Enter a city to discover hidden gems..."
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDiscover()}
          />
          <Button onClick={handleDiscover} disabled={loading || !searchCity.trim()} className="rounded-full px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>

      {/* Map */}
      {displayLocations.length > 0 && (
        <HiddenLocationMap locations={displayLocations} className="h-[450px]" />
      )}

      {/* Location cards */}
      {displayLocations.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayLocations.map((loc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryEmojis[loc.category] || '📍'}</span>
                      <div>
                        <h3 className="font-heading font-semibold text-sm">{loc.name}</h3>
                        <p className="text-xs text-muted-foreground">{loc.city}, {loc.country}</p>
                      </div>
                    </div>
                    {loc.rating && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {loc.rating}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{loc.description}</p>

                  {loc.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {loc.tags.split(',').map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag.trim()}</Badge>
                      ))}
                    </div>
                  )}

                  {loc.local_contact_name && (
                    <div className="p-3 rounded-lg bg-muted mb-3">
                      <p className="text-xs font-medium">Local Contact</p>
                      <p className="text-sm font-semibold">{loc.local_contact_name}</p>
                      <a href={`tel:${loc.local_contact_phone}`} className="text-xs text-primary flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {loc.local_contact_phone}
                      </a>
                    </div>
                  )}

                  <a
                    href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1.5 font-medium hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> View on Google Maps
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && displayLocations.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Search a city to discover hidden gems</p>
        </div>
      )}
    </div>
  );
}

