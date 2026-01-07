import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function UgandaBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Election date - January 2026
  const electionDate = new Date('2026-01-15T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = electionDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-6"
    >
      {/* Animated Waving Flag Background - Full Coverage */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 400 120"
        >
          <defs>
            <linearGradient id="ugandaFlag" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 0%, 8%)" />
              <stop offset="33.33%" stopColor="hsl(0, 0%, 8%)" />
              <stop offset="33.33%" stopColor="hsl(49, 97%, 50%)" />
              <stop offset="66.66%" stopColor="hsl(49, 97%, 50%)" />
              <stop offset="66.66%" stopColor="hsl(0, 100%, 43%)" />
              <stop offset="100%" stopColor="hsl(0, 100%, 43%)" />
            </linearGradient>
          </defs>
          
          {/* Waving flag shape */}
          <motion.path
            fill="url(#ugandaFlag)"
            animate={{
              d: [
                "M0,0 Q100,10 200,0 T400,0 V120 Q300,110 200,120 T0,120 Z",
                "M0,0 Q100,-10 200,0 T400,0 V120 Q300,130 200,120 T0,120 Z",
                "M0,0 Q100,10 200,0 T400,0 V120 Q300,110 200,120 T0,120 Z",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Dark Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content - Stacked Layout */}
      <div className="relative z-10 py-4 px-6 flex flex-col items-center justify-center text-center">
        {/* Title with Flag */}
        <div className="flex items-center gap-2 mb-3">
          <motion.span
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            🇺🇬
          </motion.span>
          <span className="font-display text-white text-xl sm:text-2xl tracking-wider drop-shadow-lg">
            UGANDA ELECTIONS 2026
          </span>
        </div>

        {/* Countdown - Below Title */}
        <div className="flex items-center gap-2">
          {[
            { value: timeLeft.days, label: 'DAYS' },
            { value: timeLeft.hours, label: 'HRS' },
            { value: timeLeft.minutes, label: 'MIN' },
            { value: timeLeft.seconds, label: 'SEC' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 text-center min-w-[45px] sm:min-w-[55px]"
              animate={{ scale: item.label === 'SEC' ? [1, 1.03, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="font-display text-white text-lg sm:text-xl block leading-none">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-white/70 text-[8px] sm:text-[9px] font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
