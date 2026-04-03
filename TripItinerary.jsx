import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TripMap from '../maps/TripMap';

const dayColors = ['bg-primary', 'bg-accent', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-1', 'bg-chart-2'];

export default function TripItinerary({ trip, onBack }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedDay, setExpandedDay] = useState(1);

  const itinerary = trip.itinerary || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold">{trip.title}</h1>
            <p className="text-muted-foreground text-sm">{trip.destination} • {itinerary.length} days</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedDay(null)}>
            All Days
          </Badge>
          {itinerary.map(day => (
            <Badge
              key={day.day}
              className={`cursor-pointer ${selectedDay === day.day ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              onClick={() => setSelectedDay(day.day === selectedDay ? null : day.day)}
            >
              Day {day.day}
            </Badge>
          ))}
        </div>
      </div>

      {/* Map */}
      <TripMap itinerary={itinerary} selectedDay={selectedDay} className="h-[400px]" />

      {/* Day-by-day */}
      <div className="space-y-3">
        {itinerary.map((day, idx) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`overflow-hidden transition-all ${selectedDay && selectedDay !== day.day ? 'opacity-40' : ''}`}>
              <button
                className="w-full p-4 flex items-center justify-between text-left"
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${dayColors[idx % dayColors.length]} text-white flex items-center justify-center font-heading font-bold text-sm`}>
                    D{day.day}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">{day.title}</h3>
                    <p className="text-xs text-muted-foreground">{day.places?.length || 0} places</p>
                  </div>
                </div>
                {expandedDay === day.day ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              {expandedDay === day.day && (
                <CardContent className="px-4 pb-4 pt-0">
                  {day.description && <p className="text-sm text-muted-foreground mb-4">{day.description}</p>}
                  <div className="space-y-3">
                    {(day.places || []).map((place, pIdx) => (
                      <div key={pIdx} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>
                          {pIdx < (day.places || []).length - 1 && (
                            <div className="w-px h-8 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{place.name}</p>
                            {place.type && <Badge variant="secondary" className="text-xs">{place.type}</Badge>}
                          </div>
                          {place.time && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {place.time}
                            </p>
                          )}
                          {place.description && <p className="text-xs text-muted-foreground mt-1">{place.description}</p>}
                          {place.lat && place.lng && (
                            <a
                              href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Open in Maps
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

