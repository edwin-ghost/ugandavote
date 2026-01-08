import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Share2, Users, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useBet } from '@/context/BetContext';
import { getReferralStats } from '@/lib/api';

const ReferralBanner = () => {
  const { user } = useBet();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  
  const userCode = user?.referral_code || 'SIGNUP';
  const referralLink = `https://ugandavote.today?ref=${userCode}`;

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await getReferralStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share with friends to earn free bets",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Uganda Bets 2026!',
          text: `Use my referral code ${userCode} and get UGX 2,500 bonus when you sign up! I earn UGX 10,000 too!`,
          url: referralLink,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // Don't show if not logged in
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl mx-4 mb-4"
    >
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500" />
      
      {/* Animated mesh pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <defs>
            <pattern id="refGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#refGrid)" />
        </svg>
      </div>

      {/* Floating coins animation */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300/40"
          initial={{ y: 100, x: 50 + i * 60, rotate: 0 }}
          animate={{ 
            y: [-10, -30, -10],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          <span className="text-2xl">💰</span>
        </motion.div>
      ))}

      {/* Sparkle effects */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{ left: `${20 + i * 25}%`, top: `${20 + (i % 2) * 40}%` }}
          animate={{ 
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-200" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Left side - Icon and text */}
        <div className="flex items-center gap-3 flex-1">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3"
          >
            <Gift className="w-6 h-6 text-white" />
          </motion.div>
          
          <div className="text-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Refer & Earn Free Bets!</h3>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎁
              </motion.span>
            </div>
            <p className="text-white/80 text-sm">
              {stats ? `${stats.total_referrals} referrals • UGX ${stats.total_earned.toLocaleString()} earned` : 'Share your code • Friends join • You both win!'}
            </p>
          </div>
        </div>

        {/* Middle - Referral code */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          <Users className="w-4 h-4 text-white/70" />
          <div className="text-center">
            <p className="text-white/60 text-xs">Your Code</p>
            <p className="text-white font-mono font-bold tracking-wider">{userCode}</p>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 mr-1" />
            ) : (
              <Copy className="w-4 h-4 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          
          <Button
            onClick={handleShare}
            size="sm"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold shadow-lg"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Bottom reward info */}
      <div className="relative z-10 bg-black/20 px-4 py-2 flex items-center justify-center gap-6 text-white/90 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-yellow-300">🎯</span>
          <span>You get <strong>UGX 10,000</strong> per referral</span>
        </div>
        <div className="w-px h-4 bg-white/30" />
        <div className="flex items-center gap-1">
          <span className="text-green-300">✓</span>
          <span>Friends get <strong>UGX 2,500</strong> bonus</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralBanner;