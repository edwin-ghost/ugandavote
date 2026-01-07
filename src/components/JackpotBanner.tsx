import { Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JackpotBannerProps {
  onOpenJackpot: () => void;
}

export function JackpotBanner({ onOpenJackpot }: JackpotBannerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative overflow-hidden rounded-lg p-4 mx-4 mb-4 shadow-lg bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500">
      {/* Celebration bubbles/circles background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating bubbles */}
        <div className="absolute w-16 h-16 bg-white/20 rounded-full -top-4 left-[10%] animate-pulse" />
        <div className="absolute w-10 h-10 bg-yellow-300/30 rounded-full top-2 left-[25%] animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute w-8 h-8 bg-white/25 rounded-full bottom-1 left-[40%] animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-12 h-12 bg-orange-300/30 rounded-full -top-2 right-[30%] animate-bounce" style={{ animationDelay: '0.3s' }} />
        <div className="absolute w-6 h-6 bg-white/20 rounded-full top-3 right-[15%] animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute w-14 h-14 bg-yellow-200/20 rounded-full -bottom-4 right-[5%] animate-bounce" style={{ animationDelay: '0.4s' }} />
        <div className="absolute w-5 h-5 bg-white/30 rounded-full bottom-2 left-[5%] animate-pulse" style={{ animationDelay: '0.6s' }} />
        <div className="absolute w-8 h-8 bg-amber-200/25 rounded-full top-1 left-[60%] animate-bounce" style={{ animationDelay: '0.1s' }} />
        
        {/* Sparkle effects */}
        <Sparkles className="absolute w-4 h-4 text-white/60 top-2 left-[18%] animate-ping" style={{ animationDuration: '2s' }} />
        <Sparkles className="absolute w-3 h-3 text-yellow-200/70 bottom-3 right-[25%] animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <Sparkles className="absolute w-4 h-4 text-white/50 top-4 right-[45%] animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/30 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
            <Trophy className="h-6 w-6 text-white drop-shadow-md" />
          </div>
          <div>
            <p className="text-white/90 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Mega Jackpot <Sparkles className="w-3 h-3" />
            </p>
            <p className="text-white text-xl font-black drop-shadow-lg">{formatCurrency(140000000)}</p>
          </div>
        </div>
        <Button 
          onClick={onOpenJackpot}
          className="bg-white text-amber-600 hover:bg-yellow-50 font-bold text-sm px-5 shadow-lg hover:scale-105 transition-transform"
        >
          🎯 Play Now
        </Button>
      </div>
    </div>
  );
}
