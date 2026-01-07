export interface Candidate {
    id: string;
    name: string;
    party: string;
    partyColor: string;
    image: string;
    odds: number;
    isLeading?: boolean;
    constituency?: string;
  }
  
  export interface Election {
    id: string;
    title: string;
    type: 'presidential' | 'parliamentary' | 'gubernatorial' | 'special';
    constituency: string;
    candidates: Candidate[];
    isFeatured?: boolean;
  }
  
  export interface BetSelection {
    id: string;
    candidate: Candidate;
    election: Election;
    odds: number;
  }
  
  export interface User {
    id: string;
    phone: string;
    balance: number;
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
  
  export interface Constituency {
    id: string;
    name: string;
    type: 'national' | 'region' | 'district';
    icon?: string;
  }
  