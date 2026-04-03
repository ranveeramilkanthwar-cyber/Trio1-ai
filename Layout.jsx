import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, Compass, Calendar, History, Star,
  Menu, X, LogOut, Shield, Trophy, Zap,
  Smile, Luggage, AlertTriangle, Leaf, TreePine,
  Heart, Share2, WifiOff, ChevronDown, ChevronUp,
  Coffee, Radar, Users
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/lib/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { path: '/', label: 'Home', icon: Home },
      { path: '/explore', label: 'Explore', icon: Compass },
      { path: '/trip-planner', label: 'Trip Planner', icon: Calendar },
      { path: '/map', label: '3D Map', icon: Map },
      { path: '/history', label: 'My Trips', icon: History },
    ]
  },
  {
    label: '🎮 Gamification',
    items: [
      { path: '/achievements', label: 'Achievements', icon: Trophy },
      { path: '/city-challenge', label: 'City Challenge', icon: Zap },
    ]
  },
  {
    label: '🤖 AI Tools',
    items: [
      { path: '/mood', label: 'Mood Itinerary', icon: Smile },
      { path: '/travel-twin', label: 'Travel Twin', icon: Users },
      { path: '/packing', label: 'Packing AI', icon: Luggage },
      { path: '/offline-guide', label: 'Offline Guide', icon: WifiOff },
      { path: '/trip-handoff', label: 'Trip Handoff', icon: Share2 },

    ]
  },
  {
    label: '🌍 Local & Hidden',
    items: [
      { path: '/hidden', label: 'Hidden Places', icon: Star },
      { path: '/gem-radar', label: 'Gem Radar', icon: Radar },
      { path: '/live-local', label: 'Live Like Local', icon: Coffee },
    ]
  },
  {
    label: '🌿 Responsible',
    items: [
      { path: '/carbon', label: 'Carbon Passport', icon: Leaf },
      { path: '/slow-travel', label: 'Slow Travel', icon: TreePine },
    ]
  },
  {
    label: '🛡️ Safety',
    items: [
      { path: '/scam-alerts', label: 'Scam Alerts', icon: AlertTriangle },
      { path: '/health', label: 'Health Guide', icon: Heart },
    ]
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({ '🎮 Gamification': false, '🤖 AI Tools': false, '🌍 Local & Hidden': false, '🌿 Responsible': false, '🛡️ Safety': false });
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.email === 'ranveer@trio.ai' || user?.role === 'admin';
  const handleLogout = () => base44.auth.logout('/');
  const toggleGroup = (label) => setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-60 flex flex-col
          glass border-r border-border
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(200 80% 50%))' }}>
            <svg width="18" height="18" viewBox="0 0 56 56" fill="none">
              <path d="M28 8 L48 20 L48 36 L28 48 L8 36 L8 20 Z" stroke="white" strokeWidth="3" fill="none" opacity="0.7"/>
              <circle cx="28" cy="28" r="7" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-black font-space gradient-text">TRIO AI</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav - scrollable */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups[group.label];
            const hasActive = group.items.some(i => i.path === location.pathname);

            return (
              <div key={group.label} className="mb-1">
                {group.label !== 'Core' && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors
                      ${hasActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <span>{group.label}</span>
                    {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                )}

                <AnimatePresence initial={false}>
                  {(!isCollapsed || group.label === 'Core') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {group.items.map(({ path, label, icon: NavIcon }) => {
                        const active = location.pathname === path;
                        return (
                          <Link key={path} to={path} onClick={() => setSidebarOpen(false)}>
                            <motion.div
                              whileHover={{ x: 3 }}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors mb-0.5
                                ${active ? 'nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                            >
                              <NavIcon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                              <span className="truncate">{label}</span>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {isAdmin && (
            <div className="mt-1">
              <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                <motion.div whileHover={{ x: 3 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors
                    ${location.pathname === '/admin' ? 'nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-orange-500">Admin Panel</span>
                </motion.div>
              </Link>
            </div>
          )}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-border flex-shrink-0">
          {user && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {user.full_name?.[0] || user.email?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.full_name || 'Traveler'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <ThemeToggle className="flex-1" />
            <button onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border glass sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="font-black font-space gradient-text text-lg">TRIO AI</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

