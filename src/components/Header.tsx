import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, History, LogIn, Menu, LogOut, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { setAuthToken, getBalance } from '@/lib/api';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

interface HeaderProps {
  onOpenHistory: () => void;
  onToggleMobileSidebar: () => void;
}

export function Header({ onOpenHistory, onToggleMobileSidebar }: HeaderProps) {
  const { user, setUser, setIsAuthOpen, setIsPaymentOpen, setIsWithdrawalOpen } = useBet();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh balance every 2 seconds when user is logged in
  useEffect(() => {
    if (user) {
      fetchBalance();
      intervalRef.current = setInterval(() => {
        fetchBalance();
      }, 2000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
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
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-2">
        {/* Left Section: Mobile Menu + Live Indicator */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <button 
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">LIVE</span>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {/* Balance - Compact on Mobile */}
              <motion.div 
                className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-muted cursor-pointer relative"
                onClick={fetchBalance}
                whileHover={{ scale: 1.02 }}
                title="Click to refresh balance"
              >
                <span className="text-xs text-muted-foreground hidden sm:inline">UGX</span>
                <span className="font-semibold text-xs sm:text-sm">
                  {formatBalance(user.balance).replace('UGX', '').trim()}
                </span>
                <RefreshCw className="w-3 h-3 text-green-500 sm:hidden" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse hidden sm:block" />
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

              {/* Withdraw Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsWithdrawalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 font-medium text-sm"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span className="hidden sm:inline">Withdraw</span>
              </motion.button>

              {/* History Button - Visible on all screens */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenHistory}
                className="p-2 sm:p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                title="Bet History"
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              {/* User Profile - Compact */}
              <div className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-uganda-black text-white">
                <User className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium hidden md:block max-w-[100px] truncate">
                  {user.phone}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded hover:bg-white/20"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-uganda-black text-white font-medium text-xs sm:text-sm hover:bg-uganda-black/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </motion.button>
          )}
        </div>
      </div>


    </header>
  );
}