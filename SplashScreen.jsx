import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plane, MapPin } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 600);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative flex flex-col items-center">
            {/* Animated circles */}
            <motion.div
              className="absolute w-64 h-64 rounded-full border border-primary/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.5, 0.2] }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute w-40 h-40 rounded-full border border-primary/30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 0.6, 0.3] }}
              transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
            />

            {/* Globe icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
              className="relative z-10 mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg" style={{ animation: 'pulse-glow 2s infinite' }}>
                <Globe className="w-10 h-10 text-primary-foreground" />
              </div>
            </motion.div>

            {/* App name */}
            <motion.h1
              className="text-5xl md:text-6xl font-heading font-bold text-foreground relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Trio <span className="text-primary">AI</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-muted-foreground mt-3 text-lg font-body relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              Your Intelligent Travel Companion
            </motion.p>

            {/* Floating icons */}
            <motion.div
              className="absolute -top-8 -right-12"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 0.6, x: 0, y: [0, -10, 0] }}
              transition={{ delay: 2, duration: 2, y: { repeat: Infinity, duration: 2 } }}
            >
              <Plane className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-16"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 0.6, x: 0, y: [0, 8, 0] }}
              transition={{ delay: 2.3, duration: 2, y: { repeat: Infinity, duration: 2.5 } }}
            >
              <MapPin className="w-6 h-6 text-accent" />
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 2.2, duration: 2.3, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

