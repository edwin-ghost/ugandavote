import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, ShoppingCart, LogIn, History, Menu, LogOut, ArrowDownToLine } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { setAuthToken, getBalance } from '@/lib/api';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

interface HeaderProps {
  onOpenHistory: () => void;
  onToggleMobileSidebar: () => void;
}

export function Header({ onOpenHistory, onToggleMobileSidebar }: HeaderProps) {
  const { user, setUser, setIsAuthOpen, setIsBasketOpen, selections, setIsPaymentOpen, setIsWithdrawalOpen } = useBet();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh balance every 2 seconds when user is logged in
  useEffect(() => {
    if (user) {
      // Fetch immediately
      fetchBalance();

      // Set up interval for auto-refresh
      intervalRef.current = setInterval(() => {
        fetchBalance();
      }, 2000); // 2 seconds

      // Cleanup on unmount or when user logs out
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const response = await getBalance();
      if (user) {
        setUser({ ...user, balance: response.data.balance });
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      // Silently fail for auto-refresh - don't show toast
      // If unauthorized, clear user session
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast.success('Logged out successfully');
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Mobile Menu */}
        <button 
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="hidden lg:flex items-center gap-2">
          <h2 className="font-display text-xl text-foreground">MARKET ODDS</h2>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">LIVE</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Balance - with auto-refresh indicator */}
              <motion.div 
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted cursor-pointer relative"
                onClick={fetchBalance}
                whileHover={{ scale: 1.02 }}
                title="Click to refresh balance"
              >
                <span className="text-xs text-muted-foreground">UGX</span>
                <span className="font-semibold text-sm">{formatBalance(user.balance).replace('UGX', '').trim()}</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Auto-updating" />
              </motion.div>

              {/* Deposit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPaymentOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-uganda-yellow text-uganda-black font-medium text-sm"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Deposit</span>
              </motion.button>


              <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsWithdrawalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium text-sm"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="hidden sm:inline">Withdraw</span>
            </motion.button>

              {/* History */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenHistory}
                className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <History className="w-5 h-5" />
              </motion.button>

              {/* User & Logout */}
              <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-uganda-black text-white">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">{user.phone}</span>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded hover:bg-white/20 ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-uganda-black text-white font-medium text-sm hover:bg-uganda-black/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </motion.button>
          )}

          {/* MY SELECTIONS */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBasketOpen(true)}
            className="relative p-2.5 rounded-xl bg-uganda-yellow text-uganda-black hover:shadow-lg hover:shadow-uganda-yellow/30 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            <AnimatePresence>
              {selections.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-uganda-red text-white text-xs font-bold flex items-center justify-center"
                >
                  {selections.length}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
}