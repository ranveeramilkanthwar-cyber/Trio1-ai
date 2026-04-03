import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3200);
    const t4 = setTimeout(() => onComplete(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020d18 0%, #041a2e 30%, #031520 60%, #020d18 100%)' }}
      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: 'easeInOut' } }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `rgba(${Math.random() > 0.5 ? '0,210,190' : '0,160,220'}, ${Math.random() * 0.6 + 0.2})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,210,190,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,190,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d2be, transparent)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center">
        {/* Logo circle */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {/* Pulse rings */}
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: 'rgba(0,210,190,0.4)' }}
                  animate={{ scale: [1, 2.5 + i * 0.3], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
              <div
                className="relative w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00d2be, #0090d0)',
                  boxShadow: '0 0 60px rgba(0,210,190,0.5), 0 0 120px rgba(0,210,190,0.2)',
                }}
              >
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <path d="M28 8 L48 20 L48 36 L28 48 L8 36 L8 20 Z" stroke="white" strokeWidth="2.5" fill="none" opacity="0.6"/>
                  <circle cx="28" cy="28" r="8" fill="white"/>
                  <path d="M28 14 L28 22 M28 34 L28 42 M14 28 L22 28 M34 28 L42 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
                  <path d="M18 18 L23 23 M33 33 L38 38 M38 18 L33 23 M23 33 L18 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App name */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-3"
                style={{
                  background: 'linear-gradient(90deg, #00d2be, #40e8f0, #00aad4, #00d2be)',
                  backgroundSize: '300% auto',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 2s linear infinite',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                TRIO AI
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg tracking-[0.3em] uppercase"
                style={{ color: 'rgba(0,210,190,0.7)' }}
              >
                Your AI Travel Companion
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading bar */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12 w-64"
            >
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,210,190,0.2)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00d2be, #40e8f0)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />
              </div>
              <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Initializing AI systems...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

