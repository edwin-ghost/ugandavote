import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, AlertCircle, Loader2, CheckCircle, ArrowDownToLine } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { toast } from 'sonner';
import { useState } from 'react';
import { withdraw } from '@/lib/api'; // Import the withdraw API function

export function WithdrawalModal() {
  const { user, setUser, isWithdrawalOpen, setIsWithdrawalOpen } = useBet();
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleWithdraw = async () => {
    if (!user) {
      toast.error('Please login to withdraw');
      return;
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    // Minimum withdrawal amount check
    if (amount < 1000) {
      toast.error('Minimum withdrawal amount is UGX 1,000');
      return;
    }

    setIsProcessing(true);

    try {
      // Call the backend API to process withdrawal
      const response = await withdraw(amount, 'MTN'); // Default method as placeholder
      
      // If successful, update the local user balance
      const newBalance = user.balance - amount;
      setUser({ ...user, balance: newBalance });

      // Show success state
      setWithdrawalSuccess(true);
      toast.success(`Withdrawal of ${formatCurrency(amount)} successful!`);

      // Reset and close after 2 seconds
      setTimeout(() => {
        setAmount(0);
        setWithdrawalSuccess(false);
        setIsWithdrawalOpen(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.error || 'Withdrawal failed. Please try again.';
      toast.error(errorMessage);
      
      // If backend says insufficient balance, don't update local state
      if (errorMessage.includes('Insufficient balance')) {
        // Optionally refresh user balance from backend
        // await fetchUserBalance();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !withdrawalSuccess) {
      setAmount(0);
      setWithdrawalSuccess(false);
      setIsWithdrawalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isWithdrawalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-card rounded-2xl border border-border z-50 shadow-2xl"
          >
            {withdrawalSuccess ? (
              // Success View
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className="font-display text-2xl mb-2">Withdrawal Successful!</h2>
                <p className="text-muted-foreground mb-4">
                  {formatCurrency(amount)} has been withdrawn
                </p>
                <p className="text-sm text-muted-foreground">
                  Your funds will be processed shortly
                </p>
              </div>
            ) : (
              // Withdrawal Form
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-uganda-yellow flex items-center justify-center">
                      <ArrowDownToLine className="w-5 h-5 text-uganda-black" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl">WITHDRAW FUNDS</h2>
                      <p className="text-xs text-muted-foreground">
                        Available: {user ? formatCurrency(user.balance) : 'UGX 0'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Withdrawal Amount (UGX)
                    </label>
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="Enter amount to withdraw"
                      className="input-field text-lg"
                      min={0}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum withdrawal: UGX 1,000
                    </p>
                  </div>

                  {/* Quick Amounts */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Quick Select</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5000, 10000, 50000, 100000].map((quickAmount) => (
                        <button
                          key={quickAmount}
                          onClick={() => setAmount(quickAmount)}
                          disabled={isProcessing || (user && quickAmount > user.balance)}
                          className="py-2 text-xs font-medium rounded-lg bg-muted hover:bg-uganda-yellow hover:text-uganda-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Withdraw All Button */}
                  {user && user.balance > 0 && (
                    <button
                      onClick={() => setAmount(user.balance)}
                      disabled={isProcessing}
                      className="w-full py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      Withdraw All ({formatCurrency(user.balance)})
                    </button>
                  )}

                  {/* Summary */}
                  {amount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-muted space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Withdrawal Amount</span>
                        <span className="font-semibold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-muted-foreground">Remaining Balance</span>
                        <span className="font-semibold">
                          {user ? formatCurrency(user.balance - amount) : 'UGX 0'}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Insufficient Balance Warning */}
                  {user && amount > user.balance && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Insufficient balance</span>
                    </div>
                  )}

                  {/* Withdraw Button */}
                  <motion.button
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                    onClick={handleWithdraw}
                    disabled={amount <= 0 || (user && amount > user.balance) || isProcessing || amount < 1000}
                    className="w-full py-4 rounded-xl bg-uganda-black text-white font-display text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-uganda-black/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      'WITHDRAW FUNDS'
                    )}
                  </motion.button>

                  {/* Info Text */}
                  <p className="text-xs text-center text-muted-foreground">
                    Withdrawals are processed  to your registered mobile money account
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}