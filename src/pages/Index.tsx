import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FeaturedMarket } from '@/components/FeaturedMarket';
import { ElectionTabs } from '@/components/ElectionTabs';
import { ElectionMarket } from '@/components/ElectionMarket';
import { BetBasket } from '@/components/BetBasket';
import { AuthModal } from '@/components/AuthModal';
import { PaymentModal } from '@/components/PaymentModal';
import { WithdrawalModal } from '@/components/WithdrawalModal';
import { FloatingBasketButton } from '@/components/FloatingBasketButton';

import { BetHistoryModal } from '@/components/BetHistoryModal';
import { UgandaBanner } from '@/components/UgandaBanner';
import { JackpotBanner } from '@/components/JackpotBanner';
import { JackpotModal } from '@/components/JackpotModal';
import ReferralBanner from '@/components/ReferralBanner';
import { BetProvider } from '@/context/BetContext';
import { elections, constituencies } from '@/data/elections';
import { X } from 'lucide-react';

function BettingApp() {
  const [selectedConstituency, setSelectedConstituency] = useState('national');
  const [activeTab, setActiveTab] = useState('all');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isJackpotOpen, setIsJackpotOpen] = useState(false);

  const featuredElection = elections.find(e => e.isFeatured);
  
  const filteredElections = useMemo(() => {
    let result = elections.filter(e => !e.isFeatured);

    // Filter by constituency
    if (selectedConstituency !== 'national') {
      const constituency = constituencies.find(c => c.id === selectedConstituency);
      if (constituency) {
        result = result.filter(e => 
          e.constituency.toLowerCase().includes(constituency.name.toLowerCase().replace(' region', '').replace(' district', ''))
        );
      }
    }

    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter(e => e.type === activeTab);
    }

    return result;
  }, [selectedConstituency, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 lg:hidden"
            >
              <Sidebar
                selectedConstituency={selectedConstituency}
                onSelectConstituency={(id) => {
                  setSelectedConstituency(id);
                  setIsMobileSidebarOpen(false);
                }}
              />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-muted/80"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          selectedConstituency={selectedConstituency}
          onSelectConstituency={setSelectedConstituency}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        <Header 
          onOpenHistory={() => setIsHistoryOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Uganda Banner with Countdown */}
          <UgandaBanner />

          {/* Jackpot Banner */}
          <JackpotBanner onOpenJackpot={() => setIsJackpotOpen(true)} />

          {/* Referral Banner */}
          <ReferralBanner />

    


          {/* Featured Market */}
          {featuredElection && selectedConstituency === 'national' && (
            <FeaturedMarket election={featuredElection} />
          )}

          {/* Tabs */}
          <ElectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Elections List */}
          <div className="space-y-6">
            {filteredElections.length > 0 ? (
              filteredElections.map((election, index) => (
                <ElectionMarket key={election.id} election={election} index={index} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                  <span className="text-4xl">🗳️</span>
                </div>
                <h3 className="font-display text-2xl text-muted-foreground">NO MARKETS FOUND</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try selecting a different constituency or category
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <FloatingBasketButton />

      <BetBasket />
      <AuthModal />
      <PaymentModal />
      <WithdrawalModal />
      <BetHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <JackpotModal isOpen={isJackpotOpen} onClose={() => setIsJackpotOpen(false)} />
    </div>
  );
}

const Index = () => {
  return (
    <BetProvider>
      <BettingApp />
    </BetProvider>
  );
};

export default Index;
