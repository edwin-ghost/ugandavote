import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Check, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { placeBet } from '@/lib/api';
import { useBet } from '@/context/BetContext';

interface JackpotCandidate {
  id: string;
  name: string;
  image: string;
}

interface JackpotSelection {
  id: number;
  race: string;
  candidates: JackpotCandidate[];
  selectedCandidate: string | null;
}

interface JackpotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialSelections: JackpotSelection[] = [
  { id: 1, race: "Presidential Race", candidates: [
    { id: "1a", name: "Y. Museveni", image: "/candidates/museveni.jpg" },
    { id: "1b", name: "R. Kyagulanyi", image: "/candidates/bobi.jpg" },
    { id: "1c", name: "K. Besigye", image: "/candidates/besigye.jpg" },
  ], selectedCandidate: null },
  { id: 2, race: "Kampala Central MP", candidates: [
    { id: "2a", name: "M. Nsereko", image: "/candidates/nsereko.jpg" },
    { id: "2b", name: "F. Zaake", image: "/candidates/zaake.jpg" },
  ], selectedCandidate: null },
  { id: 3, race: "Wakiso Woman MP", candidates: [
    { id: "3a", name: "B. Nantaba", image: "/candidates/nantaba.jpg" },
    { id: "3b", name: "R. Namuganza", image: "/candidates/namuganza.jpg" },
  ], selectedCandidate: null },
  { id: 4, race: "Jinja City East", candidates: [
    { id: "4a", name: "G. Muntu", image: "/candidates/muntu.jpg" },
    { id: "4b", name: "N. Ssemujju", image: "/candidates/ssemujju.jpg" },
  ], selectedCandidate: null },
  { id: 5, race: "Mbarara City", candidates: [
    { id: "5a", name: "Y. Museveni", image: "/candidates/museveni.jpg" },
    { id: "5b", name: "K. Besigye", image: "/candidates/besigye.jpg" },
  ], selectedCandidate: null },
  { id: 6, race: "Gulu City", candidates: [
    { id: "6a", name: "O. Ojara", image: "/candidates/ojara.jpg" },
    { id: "6b", name: "C. Lakony", image: "/candidates/lakony.jpg" },
  ], selectedCandidate: null },
  { id: 7, race: "Mbale City", candidates: [
    { id: "7a", name: "G. Muntu", image: "/candidates/muntu.jpg" },
    { id: "7b", name: "R. Kyagulanyi", image: "/candidates/bobi.jpg" },
  ], selectedCandidate: null },
  { id: 8, race: "Soroti East", candidates: [
    { id: "8a", name: "A. Nabwiso", image: "/candidates/nabwiso.jpg" },
    { id: "8b", name: "S. Kyakulaga", image: "/candidates/kyakulaga.jpg" },
  ], selectedCandidate: null },
  { id: 9, race: "Arua City", candidates: [
    { id: "9a", name: "O. Ojara", image: "/candidates/ojara.jpg" },
    { id: "9b", name: "M. Nsereko", image: "/candidates/nsereko.jpg" },
  ], selectedCandidate: null },
  { id: 10, race: "Kasese Municipality", candidates: [
    { id: "10a", name: "G. Muntu", image: "/candidates/muntu.jpg" },
    { id: "10b", name: "T. Munyagwa", image: "/candidates/munyagwa.jpg" },
  ], selectedCandidate: null },
  { id: 11, race: "Lira City", candidates: [
    { id: "11a", name: "C. Lakony", image: "/candidates/lakony.jpg" },
    { id: "11b", name: "N. Ssemujju", image: "/candidates/ssemujju.jpg" },
  ], selectedCandidate: null },
];

export function JackpotModal({ isOpen, onClose }: JackpotModalProps) {
  const [selections, setSelections] = useState<JackpotSelection[]>(initialSelections);
  const [stake, setStake] = useState<number>(5000);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { user, setUser, setIsAuthOpen, setIsPaymentOpen } = useBet();
  
  const MIN_STAKE = 5000;
  const JACKPOT_PRIZE = 140000000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSelectCandidate = (raceId: number, candidateId: string) => {
    setSelections(prev =>
      prev.map(s =>
        s.id === raceId ? { ...s, selectedCandidate: candidateId } : s
      )
    );
  };

  const selectedCount = selections.filter(s => s.selectedCandidate !== null).length;
  const allSelected = selectedCount === 11;

  const handlePlaceJackpot = async () => {
    // Validation checks
    if (!user) {
      setIsAuthOpen(true);
      toast.error('Please login to place a jackpot bet');
      return;
    }

    if (!allSelected) {
      toast.error('Please make all 11 selections');
      return;
    }
    
    if (stake < MIN_STAKE) {
      toast.error(`Minimum stake is ${formatCurrency(MIN_STAKE)}`);
      return;
    }

    if (stake > user.balance) {
      toast.error('Insufficient balance. Please top up.');
      setIsPaymentOpen(true);
      return;
    }

    setIsPlacingBet(true);
    
    try {
      // Prepare bet data for API - matching backend format
      const betSelections = selections.map(selection => {
        const candidate = selection.candidates.find(c => c.id === selection.selectedCandidate);
        return {
          candidate: `[JP] ${selection.race}: ${candidate?.name}`,
          odds: 1.0
        };
      });

      const betData = {
        stake: stake,
        selections: betSelections
      };

      // Call API to place bet
      const response = await placeBet(betData);

      // Update user balance from response
      if (response.data.new_balance !== undefined) {
        setUser({ ...user, balance: response.data.new_balance });
      }

      // Reset form and close
      setSelections(initialSelections);
      setStake(5000);
      toast.success('🎯 Jackpot bet placed successfully!');
      onClose();
      
    } catch (error: any) {
      console.error('Jackpot bet error:', error);
      
      const errorMessage = error.response?.data?.error || 'Failed to place jackpot bet';
      toast.error(errorMessage);
      
      // If insufficient balance error, update local balance
      if (error.response?.data?.balance !== undefined) {
        setUser({ ...user, balance: error.response.data.balance });
      }
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleClose = () => {
    if (!isPlacingBet) {
      setSelections(initialSelections);
      setStake(5000);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Trophy className="h-5 w-5" />
            Mega Jackpot - {formatCurrency(JACKPOT_PRIZE)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Make all 11 predictions to win! ({selectedCount}/11 selected)
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {selections.map((selection, index) => (
            <div key={selection.id} className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{selection.race}</span>
                {selection.selectedCandidate && (
                  <Check className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {selection.candidates.map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(selection.id, candidate.id)}
                    disabled={isPlacingBet}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selection.selectedCandidate === candidate.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-background hover:bg-amber-100 border'
                    }`}
                  >
                    <img 
                      src={candidate.image} 
                      alt={candidate.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E';
                      }}
                    />
                    {candidate.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 border-t pt-4 space-y-3">
          {/* Balance Display */}
          {user && (
            <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Your Balance:</span>
              <span className="font-semibold">{formatCurrency(user.balance)}</span>
            </div>
          )}

          {/* Stake Input */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Stake:</label>
            <Input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(MIN_STAKE, Number(e.target.value)))}
              min={MIN_STAKE}
              className="w-32"
              disabled={isPlacingBet}
            />
            <span className="text-xs text-muted-foreground">Min: {formatCurrency(MIN_STAKE)}</span>
          </div>

          {/* Quick Stakes */}
          <div className="flex gap-2">
            {[5000].map((amount) => (
              <button
                key={amount}
                onClick={() => setStake(amount)}
                disabled={isPlacingBet}
                className="flex-1 py-2 text-xs font-medium rounded-lg bg-muted hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {amount >= 1000 ? `${amount / 1000}K` : amount}
              </button>
            ))}
          </div>

          {/* Insufficient Balance Warning */}
          {user && stake > user.balance && (
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Insufficient balance</span>
              </div>
              <button
                onClick={() => {
                  setIsPaymentOpen(true);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-uganda-yellow text-uganda-black text-xs font-semibold whitespace-nowrap"
              >
                <Wallet className="w-3 h-3" />
                Deposit
              </button>
            </div>
          )}

          {/* Place Jackpot Button */}
          <Button
            onClick={handlePlaceJackpot}
            disabled={!allSelected || isPlacingBet || (user && stake > user.balance)}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacingBet ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                PLACING BET...
              </div>
            ) : !user ? (
              'LOGIN TO PLACE BET'
            ) : !allSelected ? (
              `Select all 11 matches (${selectedCount}/11)`
            ) : user && stake > user.balance ? (
              'INSUFFICIENT BALANCE'
            ) : (
              `Place Jackpot - ${formatCurrency(stake)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}