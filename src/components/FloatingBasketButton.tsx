import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useBet } from '@/context/BetContext';

export function FloatingBasketButton() {
  const { selections, setIsBasketOpen } = useBet();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsBasketOpen(true)}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-uganda-yellow text-uganda-black shadow-2xl hover:shadow-uganda-yellow/50 transition-all flex items-center justify-center"
      style={{
        boxShadow: '0 10px 40px rgba(252, 209, 22, 0.4)',
      }}
    >
      <ShoppingCart className="w-7 h-7" />
      
      {/* Badge with count */}
      <AnimatePresence>
        {selections.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 15
              }
            }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-uganda-red text-white font-bold flex items-center justify-center shadow-lg"
          >
            <motion.span
              key={selections.length}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm"
            >
              {selections.length}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse effect when selections are added */}
      {selections.length > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full bg-uganda-yellow"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
}