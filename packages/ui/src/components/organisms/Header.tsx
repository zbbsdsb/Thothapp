import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  logo: React.ReactNode;
  logoText: string;
  logoSubtext: string;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user?: {
    name: string;
    photoURL: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  logoText,
  logoSubtext,
  tabs,
  activeTab,
  onTabChange,
  user,
  onLogin,
  onLogout,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dream-bg/40 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 sm:gap-4 group cursor-pointer" 
          onClick={() => onTabChange('record')}
        >
          {logo}
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-serif italic font-light tracking-tight dream-text-gradient">
              {logoText}
            </span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
              {logoSubtext}
            </span>
          </div>
        </motion.div>

        <div className="hidden lg:flex items-center gap-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] transition-all relative py-2 ${
                activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <span className={`transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-dream-accent' : ''}`}>
                {tab.icon}
              </span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-dream-accent rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Dreamer</p>
                <p className="text-sm font-medium text-white/80">{user.name.split(' ')[0]}</p>
              </div>
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src={user.photoURL} 
                alt="Avatar" 
                className="w-9 h-9 sm:w-11 h-11 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-4 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-dream-accent hover:text-white transition-all duration-500 shadow-2xl shadow-white/5"
            >
              Begin
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dream-bg/80 backdrop-blur-3xl border-t border-white/5 px-6 py-4 pb-8">
        <div className="flex items-center justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                activeTab === tab.id ? 'text-dream-accent' : 'text-white/30'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </nav>
  );
};
