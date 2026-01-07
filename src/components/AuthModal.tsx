import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useBet } from '@/context/BetContext';
import { toast } from 'sonner';
import { loginUser, registerUser, setAuthToken, getBalance } from '@/lib/api';

export function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, setUser } = useBet();
  const [isLogin, setIsLogin] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const res = isLogin
        ? await loginUser(phone, pin)
        : await registerUser(phone, pin);
  
      const { token, user } = res.data;
  
      if (!token) {
        throw new Error('No token returned');
      }
  
      // Set token globally
      setAuthToken(token);
  
      // Fetch balance AFTER token is set
      const balanceRes = await getBalance();
  
      setUser({
        id: user.id,
        phone: user.phone,
        balance: balanceRes.data.balance,
      });
  
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      setIsAuthOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Authentication failed');
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
                      : 'Join Uganda Elections'}
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
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="7XX XXX XXX"
                        className="input-field pl-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        +256
                      </span>
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
