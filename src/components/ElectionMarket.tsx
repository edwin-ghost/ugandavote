import { motion } from 'framer-motion';
import { Election } from '@/types';
import { CandidateCard } from './CandidateCard';

interface ElectionMarketProps {
  election: Election;
  index: number;
}

export function ElectionMarket({ election, index }: ElectionMarketProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl text-foreground">{election.title}</h3>
          <p className="text-sm text-muted-foreground">{election.constituency}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted capitalize">
          {election.type}
        </span>
      </div>

      {/* Candidates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {election.candidates.map((candidate, i) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            election={election}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
