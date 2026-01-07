import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ElectionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'all', label: 'All Markets' },
  { id: 'presidential', label: 'Presidential' },
  { id: 'parliamentary', label: 'Parliamentary' },
  { id: 'gubernatorial', label: 'Local Government' },
  { id: 'special', label: 'Special Seats' },
];

export function ElectionTabs({ activeTab, onTabChange }: ElectionTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted/50 rounded-2xl w-fit">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange(tab.id)}
          className={cn('tab-button relative', activeTab === tab.id && 'active')}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-uganda-black rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
