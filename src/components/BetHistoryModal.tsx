import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Clock, CheckCircle, XCircle, Calendar, Ticket, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBetHistory } from '@/lib/api';

interface BetHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BetHistoryModal({ isOpen, onClose }: BetHistoryModalProps) {
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadBetHistory();
    }
  }, [isOpen]);

  const loadBetHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBetHistory();
      
      // Transform backend data to match component expectations
      const transformedData = response.data.map(bet => ({
        id: bet.id,
        stake: bet.stake,
        totalOdds: bet.total_odds,
        possibleWinnings: bet.possible_win,
        status: bet.status,
        createdAt: new Date(bet.created_at),
        selections: bet.selections || [],
        // Detect if it's a jackpot bet by checking if all selections start with [JP]
        isJackpot: bet.selections?.every(s => s.candidate_name?.startsWith('[JP]'))
      }));
      
      setBetHistory(transformedData);
    } catch (err) {
      console.error('Failed to load bet history:', err);
      setError('Failed to load bet history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-UG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-uganda-yellow', bg: 'bg-uganda-yellow/10' },
    won: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    lost: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <div className="bg-card rounded-3xl shadow-elevated overflow-hidden flex flex-col w-full max-w-lg max-h-[80vh]">
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-uganda-black flex items-center justify-center">
                    <History className="w-5 h-5 text-uganda-yellow" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">BET HISTORY</h2>
                    <p className="text-xs text-muted-foreground">{betHistory.length} bet(s)</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uganda-yellow"></div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <XCircle className="w-16 h-16 text-red-500/30 mb-4" />
                    <h3 className="font-display text-xl text-muted-foreground">ERROR</h3>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <button
                      onClick={loadBetHistory}
                      className="mt-4 px-4 py-2 bg-uganda-yellow text-uganda-black rounded-lg font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : betHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Ticket className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="font-display text-xl text-muted-foreground">NO BETS YET</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your bet history will appear here
                    </p>
                  </div>
                ) : (
                  betHistory.map((bet) => {
                    const StatusIcon = statusConfig[bet.status].icon;
                    return (
                      <motion.div
                        key={bet.id}
                        layout
                        className="glass-card rounded-xl p-4"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(bet.createdAt)}
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[bet.status].bg} ${statusConfig[bet.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                          </div>
                        </div>

                        {/* Selections */}
                        {bet.selections && bet.selections.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {bet.isJackpot ? (
                              // Jackpot bet - show as single entry with trophy icon
                              <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-3 rounded-lg border-2 border-amber-500/30">
                                <div className="bg-amber-500 rounded-full p-2">
                                  <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-amber-600">🎯 Mega Jackpot Bet</p>
                                  <p className="text-xs text-muted-foreground">11 race predictions</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                                  <p className="font-bold text-amber-600 text-sm">{formatCurrency(140000000)}</p>
                                </div>
                              </div>
                            ) : (
                              // Regular bets
                              bet.selections.map((selection, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div className="flex-1">
                                    <p className="font-medium">{selection.candidate_name}</p>
                                  </div>
                                  <span className="odds-badge text-xs ml-2">{selection.odds.toFixed(2)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Stake</p>
                            <p className="font-semibold text-sm">{formatCurrency(bet.stake)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{bet.isJackpot ? 'Type' : 'Odds'}</p>
                            <p className={`font-semibold text-sm ${bet.isJackpot ? 'text-amber-600' : 'text-uganda-yellow'}`}>
                              {bet.isJackpot ? 'Jackpot' : bet.totalOdds.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Winnings</p>
                            <p className="font-semibold text-sm">{formatCurrency(bet.possibleWinnings)}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}