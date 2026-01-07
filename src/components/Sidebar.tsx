import { motion } from 'framer-motion';
import { MapPin, Vote, Globe, Building, Users } from 'lucide-react';
import { constituencies } from '@/data/elections';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedConstituency: string;
  onSelectConstituency: (id: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  national: <Globe className="w-4 h-4" />,
  region: <MapPin className="w-4 h-4" />,
  district: <Building className="w-4 h-4" />,
};

export function Sidebar({ selectedConstituency, onSelectConstituency }: SidebarProps) {
  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-uganda-black flex items-center justify-center">
            <Vote className="w-5 h-5 text-uganda-yellow" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">UGANDA</h1>
            <p className="text-xs text-muted-foreground font-medium">Elections</p>
          </div>
        </div>
      </div>

      {/* Constituencies */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        <div className="px-4 mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Constituencies
          </span>
        </div>
        
        <nav className="px-2 space-y-1">
          {constituencies.map((constituency) => (
            <motion.button
              key={constituency.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectConstituency(constituency.id)}
              className={cn(
                'sidebar-item w-full text-left',
                selectedConstituency === constituency.id && 'active'
              )}
            >
              {iconMap[constituency.type]}
              <span>{constituency.name}</span>
              {constituency.type === 'national' && (
                <span className="ml-auto leading-badge">
                  <Users className="w-3 h-3" />
                  All
                </span>
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="uganda-stripe h-2 rounded-full" />
        <p className="text-xs text-muted-foreground text-center mt-3">
          © 2026 Uganda Elections
        </p>
      </div>
    </aside>
  );
}
