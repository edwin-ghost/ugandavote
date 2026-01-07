import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id?: string;
  phone: string;
  balance: number;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyColor: string;
  odds: number;
  imageUrl?: string;
  image?: string;
  isLeading?: boolean;
}

export interface Election {
  id: string;
  title: string;
  category: string;
  type?: string;
  closingDate: Date;
}

export interface BetSelection {
  id: string;
  election: Election;
  candidate: Candidate;
  odds: number;
}

export interface Bet {
  id: string;
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  possibleWinnings: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: Date;
}

interface BetContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  selections: BetSelection[];
  addSelection: (candidate: Candidate, election: Election) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  stake: number;
  setStake: (amount: number) => void;
  totalOdds: number;
  possibleWinnings: number;
  betHistory: Bet[];
  setBetHistory: (bets: Bet[]) => void;
  addBetToHistory: (bet: Bet) => void;
  isBasketOpen: boolean;
  setIsBasketOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isPaymentOpen: boolean;
  setIsPaymentOpen: (open: boolean) => void;
  isWithdrawalOpen: boolean;
  setIsWithdrawalOpen: (open: boolean) => void;
  logout: () => void;
}

const BetContext = createContext<BetContextType | undefined>(undefined);

export function BetProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage
  const [user, setUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(0);
  const [betHistory, setBetHistory] = useState<Bet[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  // Persist user to localStorage whenever it changes
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Logout function to clear everything
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    clearSelections();
    setBetHistory([]);
  };

  const addSelection = (candidate: Candidate, election: Election) => {
    const selection: BetSelection = {
      id: `${election.id}-${candidate.id}`,
      election,
      candidate,
      odds: candidate.odds,
    };

    setSelections((prev) => {
      // Remove any existing selection from the same election
      const filtered = prev.filter((s) => s.election.id !== selection.election.id);
      return [...filtered, selection];
    });
  };

  const removeSelection = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const clearSelections = () => {
    setSelections([]);
    setStake(0);
  };

  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
  const possibleWinnings = stake * totalOdds;

  const addBetToHistory = (bet: Bet) => {
    setBetHistory((prev) => [bet, ...prev]);
  };

  return (
    <BetContext.Provider
      value={{
        user,
        setUser,
        selections,
        addSelection,
        removeSelection,
        clearSelections,
        stake,
        setStake,
        totalOdds,
        possibleWinnings,
        betHistory,
        setBetHistory,
        addBetToHistory,
        isBasketOpen,
        setIsBasketOpen,
        isAuthOpen,
        setIsAuthOpen,
        isPaymentOpen,
        setIsPaymentOpen,
        isWithdrawalOpen,
        setIsWithdrawalOpen,
        logout,
      }}
    >
      {children}
    </BetContext.Provider>
  );
}

export function useBet() {
  const context = useContext(BetContext);
  if (!context) {
    throw new Error('useBet must be used within BetProvider');
  }
  return context;
}