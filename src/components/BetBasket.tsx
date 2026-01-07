import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, AlertCircle, Wallet, Loader2 } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { toast } from 'sonner';
import { placeBet } from '@/lib/api';
import { useState } from 'react';

export function BetBasket() {
  const {
    selections,
    removeSelection,
    clearSelections,
    stake,
    setStake,
    totalOdds,
    possibleWinnings,
    isBasketOpen,
    setIsBasketOpen,
    user,
    setUser,
    setIsAuthOpen,
    setIsPaymentOpen,
    addBetToHistory,
  } = useBet();

  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePlaceBet = async () => {
    if (!user) {
      setIsAuthOpen(true);
      toast.error('Please login to place a bet');
      return;
    }

    if (stake <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    if (stake > user.balance) {
      toast.error('Insufficient balance. Please top up.');
      return;
    }

    setIsPlacingBet(true);

    try {
      // Prepare bet data for API - matching backend format
      const betData = {
        stake,
        selections: selections.map(sel => ({
          candidate: sel.candidate.name,
          odds: sel.odds,
        })),
      };

      // Call API to place bet
      const response = await placeBet(betData);

      // Update user balance from response
      if (response.data.new_balance !== undefined) {
        setUser({ ...user, balance: response.data.new_balance });
      }

      // Add bet to local history
      const bet = {
        id: response.data.bet_id || `bet-${Date.now()}`,
        selections: [...selections],
        stake,
        totalOdds,
        possibleWinnings,
        status: 'pending' as const,
        createdAt: new Date(),
      };

      addBetToHistory(bet);
      clearSelections();
      setIsBasketOpen(false);
      toast.success('Bet placed successfully!');
    } catch (error: any) {
      console.error('Error placing bet:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.error || 'Failed to place bet. Please try again.';
      toast.error(errorMessage);

      // If insufficient balance error, update local balance
      if (error.response?.data?.balance !== undefined) {
        setUser({ ...user, balance: error.response.data.balance });
      }
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <AnimatePresence>
      {isBasketOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBasketOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-uganda-yellow flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-uganda-black" />
                </div>
                <div>
                  <h2 className="font-display text-xl">BET BASKET</h2>
                  <p className="text-xs text-muted-foreground">{selections.length} selection(s)</p>
                </div>
              </div>
              <button
                onClick={() => setIsBasketOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-xl text-muted-foreground">EMPTY BASKET</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add selections to start bidding
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {selections.map((selection) => (
                    <motion.div
                      key={selection.id}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            {selection.election.title}
                          </p>
                          <p className="font-medium">{selection.candidate.name}</p>
                          <div 
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs mt-1"
                            style={{ 
                              backgroundColor: `${selection.candidate.partyColor}20`,
                              color: selection.candidate.partyColor 
                            }}
                          >
                            {selection.candidate.party}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="odds-badge">{selection.odds.toFixed(2)}</span>
                          <button
                            onClick={() => removeSelection(selection.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {selections.length > 0 && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Clear All */}
                <button
                  onClick={clearSelections}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>

                {/* Stats */}
                <div className="space-y-2 py-3 border-t border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Odds</span>
                    <span className="font-bold text-uganda-yellow">{totalOdds.toFixed(2)}</span>
                  </div>
                </div>

                {/* Stake Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Stake (UGX)</label>
                  <input
                    type="number"
                    value={stake || ''}
                    onChange={(e) => setStake(Number(e.target.value))}
                    placeholder="Enter stake amount"
                    className="input-field"
                    min={0}
                    disabled={isPlacingBet}
                  />
                </div>

                {/* Quick Stakes */}
                <div className="flex gap-2">
                  {[1000, 5000, 10000, 50000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setStake(amount)}
                      disabled={isPlacingBet}
                      className="flex-1 py-2 text-xs font-medium rounded-lg bg-muted hover:bg-uganda-yellow hover:text-uganda-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {amount >= 1000 ? `${amount / 1000}K` : amount}
                    </button>
                  ))}
                </div>

                {/* Possible Winnings */}
                {stake > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-uganda-yellow/10 border border-uganda-yellow/20"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Possible Winnings</span>
                      <span className="font-display text-xl text-uganda-yellow">
                        {formatCurrency(possibleWinnings)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Insufficient Balance Warning */}
                {user && stake > user.balance && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Insufficient balance. Please top up.</span>
                    </div>
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-uganda-yellow text-uganda-black text-xs font-semibold whitespace-nowrap"
                    >
                      <Wallet className="w-3 h-3" />
                      Deposit
                    </button>
                  </div>
                )}

                {/* Place Bet Button */}
                <motion.button
                  whileHover={{ scale: isPlacingBet ? 1 : 1.02 }}
                  whileTap={{ scale: isPlacingBet ? 1 : 0.98 }}
                  onClick={handlePlaceBet}
                  disabled={stake <= 0 || (user && stake > user.balance) || isPlacingBet}
                  className="w-full py-4 rounded-xl bg-uganda-black text-white font-display text-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-uganda-black/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isPlacingBet ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      PLACING BET...
                    </>
                  ) : (
                    user ? 'PLACE BET' : 'LOGIN TO BET'
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}