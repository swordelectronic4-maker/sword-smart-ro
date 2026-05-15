import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment + Math.random() * 2;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    const dismissTimer = setTimeout(() => {
      setDismissed(true);
      onComplete?.();
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center"
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.5 }}
        >
          <motion.img
            src="/assets/logo.png"
            alt="SWORD"
            className="w-[120px] h-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />
          <motion.p
            className="font-display text-display-md text-[#D4AF37] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            SWORD
          </motion.p>

          {/* Progress bar */}
          <div className="w-[200px] h-[2px] bg-[rgba(255,255,255,0.1)] overflow-hidden">
            <motion.div
              className="h-full bg-[#D4AF37]"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <motion.p
            className="text-data-sm text-[#666666] mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.min(Math.round(progress), 100)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
