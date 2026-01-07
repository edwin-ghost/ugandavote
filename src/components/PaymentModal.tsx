import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CreditCard, Copy, CheckCircle, Bitcoin } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from '@/lib/api';

const paymentMethods = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    color: '#FFCC00',
    logo: '📱',
    phoneNumber: '0700123456',
    instructions: [
      'Dial *165#',
      'Select "Send Money"',
      'Enter Amount',
      'Enter your PIN',
      'Confirm payment',
      'Wait for balance to reflect',
    ],
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    color: '#FF0000',
    logo: '📲',
    phoneNumber: '0750654321',
    instructions: [
      'Dial *185*9#',
      'Select Pay Bill',
      'Enter Amount',
      'Enter your PIN',
      'Confirm payment',
      'Wait for balance to reflect',
    ],
  },
  {
    id: 'mpesa',
    name: 'Mpesa',
    color: '#FFB000',
    logo: '📲',
    instructions: ['Enter your phone number to receive an STK Push.'],
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    color: '#F7931A',
    logo: <Bitcoin className="w-6 h-6" />,
    wallet: '1FfmbHfnpaZjKFvyi1okTjJJusN455paPH',
    instructions: ['Send your Bitcoin payment to the wallet above.'],
  },
];

export function PaymentModal() {
  const { isPaymentOpen, setIsPaymentOpen, user } = useBet();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedPayment = paymentMethods.find(p => p.id === selectedMethod);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber || !amount) return toast.error('Enter phone number and amount');

    setLoading(true);
    try {
      // Call backend to initiate STK Push
      const res = await axios.post('/payments/mpesa', {
        phone: phoneNumber,
        amount: parseInt(amount),
      });
      toast.success('STK Push sent! Check your phone.');
      setSelectedMethod(null);
      setAmount('');
      setPhoneNumber('');
      setIsPaymentOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Mpesa payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(bal);
  };

  return (
    <AnimatePresence>
      {isPaymentOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsPaymentOpen(false);
              setSelectedMethod(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-3xl shadow-elevated overflow-hidden w-full max-w-md">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl">TOP UP BALANCE</h2>
                    {user && (
                      <p className="text-sm text-muted-foreground">
                        Current balance: <span className="font-semibold text-uganda-yellow">{formatBalance(user.balance)}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsPaymentOpen(false);
                      setSelectedMethod(null);
                    }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!selectedMethod ? (
                  <>
                    {/* Amount Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Amount (UGX)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount to deposit"
                        className="input-field text-center text-xl font-semibold"
                      />
                      <div className="flex gap-2 mt-3">
                        {[10000, 50000, 100000, 500000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setAmount(amt.toString())}
                            className="flex-1 py-2 text-xs font-medium rounded-lg bg-muted hover:bg-uganda-yellow hover:text-uganda-black transition-colors"
                          >
                            {amt >= 1000 ? `${amt / 1000}K` : amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select Payment Method</p>
                      {paymentMethods.map((method) => (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMethod(method.id)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-uganda-yellow transition-colors"
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${method.color}20` }}
                          >
                            {method.logo}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold">{method.name}</p>
                            <p className="text-sm text-muted-foreground">Instant deposit</p>
                          </div>
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Payment Instructions */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <button
                        onClick={() => setSelectedMethod(null)}
                        className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                      >
                        ← Back to methods
                      </button>

                      <div
                        className="p-4 rounded-xl mb-4"
                        style={{ backgroundColor: `${selectedPayment?.color}15` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">{selectedPayment?.logo}</span>
                          <div>
                            <p className="font-semibold">{selectedPayment?.name}</p>
                            <p className="text-sm text-muted-foreground">Payment Instructions</p>
                          </div>
                        </div>

                        {/* Mpesa STK Push */}
                        {selectedPayment?.id === 'mpesa' && (
                          <div className="space-y-3">
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Enter your phone number"
                              className="input-field w-full text-center mb-2"
                            />
                            <button
                              onClick={handleMpesaPayment}
                              disabled={loading}
                              className="w-full py-3 rounded-xl bg-uganda-yellow text-uganda-black font-semibold"
                            >
                              {loading ? 'Processing...' : 'Send STK Push'}
                            </button>
                          </div>
                        )}

                        {/* Bitcoin Wallet */}
                        {selectedPayment?.id === 'bitcoin' && (
                          <div className="bg-card rounded-lg p-3 mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Bitcoin Wallet</p>
                              <p className="font-display text-sm break-all">{selectedPayment.wallet}</p>
                            </div>
                            <button
                              onClick={() => handleCopy(selectedPayment.wallet || '')}
                              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            >
                              {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                          </div>
                        )}

                        {/* Phone Number for MTN/Airtel */}
                        {(selectedPayment?.id === 'mtn' || selectedPayment?.id === 'airtel') && selectedPayment?.phoneNumber && (
                          <div className="mb-4">
                            <p className="text-sm mb-2">Send money to:</p>
                            <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                              <p className="font-display text-xl text-black">{selectedPayment.phoneNumber}</p>
                              <button
                                onClick={() => handleCopy(selectedPayment.phoneNumber || '')}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-black" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Amount Display for all except Mpesa */}
                        {amount && selectedPayment?.id !== 'mpesa' && (
                          <div className="bg-card rounded-lg p-3 mb-4">
                            <p className="text-xs text-muted-foreground">Amount to Send</p>
                            <p className="font-display text-2xl text-uganda-yellow">
                              UGX {parseInt(amount).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {/* Instructions */}
                        {selectedPayment?.instructions.map((step, i) => (
                          <div key={i} className="flex gap-3 items-start mb-2">
                            <span className="w-6 h-6 rounded-full bg-card flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}

                        <p className="text-xs text-center text-muted-foreground mt-3">
                          Your balance will be updated once payment is confirmed
                        </p>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}