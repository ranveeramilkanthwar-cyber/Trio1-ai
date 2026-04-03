

import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/lib/ThemeContext';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import TripPlanner from '@/pages/TripPlanner';
import MapView from '@/pages/MapView';
import HiddenPlaces from '@/pages/HiddenPlaces';
import UserHistory from '@/pages/UserHistory';
import AdminPanel from '@/pages/AdminPanel';
import Achievements from '@/pages/Achievements';
import CityChallenge from '@/pages/CityChallenge';
import OfflineGuide from '@/pages/OfflineGuide';
import TripHandoff from '@/pages/TripHandoff';
import TravelTwin from '@/pages/TravelTwin';
import MoodItinerary from '@/pages/MoodItinerary';
import LiveLikeLocal from '@/pages/LiveLikeLocal';
import HiddenGemRadar from '@/pages/HiddenGemRadar';
import CarbonPassport from '@/pages/CarbonPassport';
import SlowTravel from '@/pages/SlowTravel';
import PackingAI from '@/pages/PackingAI';
import ScamAlerts from '@/pages/ScamAlerts';
import HealthGuide from '@/pages/HealthGuide';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem('trio-ai-intro-seen');
    if (seen) setShowIntro(false);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('trio-ai-intro-seen', '1');
  };

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroScreen key="intro" onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/hidden" element={<HiddenPlaces />} />
          <Route path="/history" element={<UserHistory />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/city-challenge" element={<CityChallenge />} />
          <Route path="/offline-guide" element={<OfflineGuide />} />
          <Route path="/trip-handoff" element={<TripHandoff />} />
          <Route path="/travel-twin" element={<TravelTwin />} />
          <Route path="/mood" element={<MoodItinerary />} />
          <Route path="/live-local" element={<LiveLikeLocal />} />
          <Route path="/gem-radar" element={<HiddenGemRadar />} />
          <Route path="/carbon" element={<CarbonPassport />} />
          <Route path="/slow-travel" element={<SlowTravel />} />
          <Route path="/packing" element={<PackingAI />} />
          <Route path="/scam-alerts" element={<ScamAlerts />} />
          <Route path="/health" element={<HealthGuide />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;