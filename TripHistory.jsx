import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, MapPin, Calendar, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import TripItinerary from '../components/trip/TripItinerary';

const statusColors = {
  planning: 'bg-chart-3/10 text-chart-3',
  active: 'bg-primary/10 text-primary',
  completed: 'bg-chart-2/10 text-chart-2',
};

export default function TripHistory() {
  const [viewTrip, setViewTrip] = useState(null);
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['my-trips'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Trip.filter({ created_by: user.email }, '-created_date', 50);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Trip.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-trips'] }),
  });

  if (viewTrip) {
    return <TripItinerary trip={viewTrip} onBack={() => setViewTrip(null)} />;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold">My Trips</h1>
          <p className="text-muted-foreground mt-2">Your personal travel history</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No trips yet. Start planning your first trip!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {trips.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold">{trip.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {trip.destination}
                      </p>
                    </div>
                    <Badge className={statusColors[trip.status] || statusColors.planning}>
                      {trip.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    {trip.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(trip.start_date), 'MMM d, yyyy')}
                      </span>
                    )}
                    <span>{trip.itinerary?.length || 0} days</span>
                    <span className="capitalize">{trip.budget}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewTrip(trip)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(trip.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

