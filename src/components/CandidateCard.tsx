import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, User } from 'lucide-react';
import { Candidate, Election } from '@/types';
import { useBet } from '@/context/BetContext';
import { cn } from '@/lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
  election: Election;
  index: number;
  featured?: boolean;
}

export function CandidateCard({ candidate, election, index, featured = false }: CandidateCardProps) {
  const { addSelection, selections, removeSelection } = useBet();
  const [imageError, setImageError] = useState(false);
  
  const isSelected = selections.some(
    s => s.candidate.id === candidate.id && s.election.id === election.id
  );

  const handleClick = () => {
    if (isSelected) {
      const selection = selections.find(
        s => s.candidate.id === candidate.id && s.election.id === election.id
      );
      if (selection) removeSelection(selection.id);
    } else {
      addSelection(candidate, election);
    }
  };

  // Determine position based on election type
  const getPosition = () => {
    switch (election.type) {
      case 'presidential':
        return 'President';
      case 'parliamentary':
        return 'Member of Parliament';
      case 'gubernatorial':
        return 'Mayor / LC5';
      case 'special':
        return 'Special Seat';
      default:
        return 'Candidate';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      className={cn(
        'relative p-3 rounded-xl border cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-uganda-yellow bg-uganda-yellow/10 shadow-md'
          : 'border-border bg-card hover:border-uganda-yellow/50 hover:shadow-sm'
      )}
    >
      {/* Leading Badge */}
      {candidate.isLeading && (
        <div className="absolute -top-2 left-2 z-10">
          <span className="leading-badge text-[10px] px-1.5 py-0.5">
            <Crown className="w-2.5 h-2.5" />
            Leading
          </span>
        </div>
      )}

      {/* Main Content - Horizontal Layout */}
      <div className="flex items-center gap-3">
        {/* Small Rounded Image - Left */}
        <div
          className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: candidate.partyColor }}
        >
          {imageError ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={candidate.image}
              alt={candidate.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Info - Middle */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate leading-tight">{candidate.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: candidate.partyColor }}
            />
            <span className="text-xs text-muted-foreground truncate">{candidate.party}</span>
          </div>
          <span className="text-[10px] text-muted-foreground/70">{getPosition()}</span>
        </div>

        {/* Odds Button - Right (Clickable) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={cn(
            'px-3 py-2 rounded-lg font-bold text-sm transition-all flex-shrink-0',
            isSelected
              ? 'bg-uganda-yellow text-uganda-black'
              : 'bg-muted hover:bg-uganda-yellow hover:text-uganda-black'
          )}
        >
          {candidate.odds.toFixed(2)}
        </motion.button>
      </div>
    </motion.div>
  );
}