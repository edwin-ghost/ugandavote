import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Star } from 'lucide-react';
import { Election } from '@/types';
import { CandidateCard } from './CandidateCard';

interface FeaturedMarketProps {
  election: Election;
}

export function FeaturedMarket({ election }: FeaturedMarketProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-uganda-yellow to-yellow-400 flex items-center justify-center shadow-lg shadow-uganda-yellow/30">
          <Trophy className="w-6 h-6 text-uganda-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-3xl text-foreground">{election.title}</h2>
            <Star className="w-5 h-5 text-uganda-yellow fill-uganda-yellow" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Featured Market • {election.constituency}</span>
          </div>
        </div>
      </div>

      {/* Candidates Grid - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {election.candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            election={election}
            index={index}
            featured
          />
        ))}
      </div>
    </motion.section>
  );
}
