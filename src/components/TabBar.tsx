import { Mic2, History, Globe, Settings } from 'lucide-react';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: 'record' | 'history' | 'global' | 'settings') => void;
}

const TABS = [
  { id: 'record', icon: Mic2, label: 'Capture' },
  { id: 'history', icon: History, label: 'Archive' },
  { id: 'global', icon: Globe, label: 'Collective' },
  { id: 'settings', icon: Settings, label: 'Profile' },
] as const;

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dream-bg/80 backdrop-blur-3xl border-t border-white/5 px-6 py-4 pb-8">
      <div className="flex items-center justify-between">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === tab.id ? 'text-dream-accent' : 'text-white/30'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'scale-110' : ''}`} />
            <span className="text-[8px] font-bold uppercase tracking-widest">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
