import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, Eye, EyeOff, User, ArrowRight, Gift } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { toast } from 'sonner';
import { registerUser, loginUser, setAuthToken } from '@/lib/api';

export function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUser } = useBet();
  const [isLogin, setIsLogin] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const normalizePhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 9);
  };

  // Pre-fill referral code from URL if available
  useEffect(() => {
    const storedCode = localStorage.getItem('referralCode');
    if (storedCode && !isLogin) {
      setReferralCode(storedCode);
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!/^7\d{8}$/.test(phone)) {
      toast.error('Phone must be in format 7XXXXXXXX');
      return;
    }
  
    if (!/^\d{4}$/.test(pin)) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const fullPhone = phone; // ✅ EXACTLY WHAT BACKEND EXPECTS
  
      let response;
      if (isLogin) {
        response = await loginUser(fullPhone, pin);
      } else {
        response = await registerUser(fullPhone, pin, referralCode);
      }
  
      const { token, user } = response.data;
  
      setAuthToken(token);
  
      setUser({
        id: user.id,
        phone: user.phone,
        balance: user.balance,
        bonus_balance: user.bonus_balance,
        referral_code: user.referral_code,
      });
  
      setIsAuthOpen(false);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAuthOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-3xl shadow-elevated overflow-hidden w-full max-w-md relative">
              {/* Header Decoration */}
              <div className="uganda-stripe h-2" />

              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsAuthOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-uganda-black mx-auto flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-uganda-yellow" />
                  </div>
                  <h2 className="font-display text-3xl mb-1">
                    {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isLogin 
                      ? 'Enter your credentials to continue' 
                      : 'Join Uganda Elections Betting'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(normalizePhone(e.target.value))}
                        placeholder="768912345"
                        className="input-field pl-12"
                      />
                      {/* <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        +256
                      </span> */}
                    </div>
                  </div>

                  {/* PIN */}
                  <div>
                    <label className="block text-sm font-medium mb-2">4-Digit PIN</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••"
                        maxLength={4}
                        className="input-field pl-12 pr-12 tracking-[0.5em] text-center font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Referral Code - Only show on signup */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-uganda-yellow" />
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase().slice(0, 10))}
                          placeholder="Enter code (e.g. ABC123)"
                          className="input-field pl-12 uppercase tracking-wider"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <span className="text-uganda-yellow">✨</span>
                        Get UGX 2,500 bonus! Referrer gets UGX 10,000!
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-uganda-black text-white font-display text-xl tracking-wide flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Toggle */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isLogin ? (
                      <>Don't have an account? <span className="font-semibold text-uganda-yellow">Sign up</span></>
                    ) : (
                      <>Already have an account? <span className="font-semibold text-uganda-yellow">Login</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}