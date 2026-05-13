import { motion } from 'motion/react';
import { Mic2, History, Globe, Settings, User, BookOpen } from 'lucide-react';
import { ThothLogo } from './Logo';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import type { FirebaseUser } from 'firebase/auth';

interface NavigationProps {
  user: FirebaseUser | null;
  activeTab: string;
  onTabChange: (tab: 'record' | 'history' | 'global' | 'settings' | 'docs') => void;
}

const NAV_ITEMS = [
  { id: 'record', label: 'Capture', icon: Mic2 },
  { id: 'history', label: 'Archive', icon: History },
  { id: 'global', label: 'Collective', icon: Globe },
  { id: 'docs', label: 'Docs', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function Navigation({ user, activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dream-bg/40 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 sm:gap-4 group cursor-pointer"
          onClick={() => onTabChange('record')}
        >
          <ThothLogo className="w-10 h-10 sm:w-12 h-12" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-serif italic font-light tracking-tight dream-text-gradient">
              Thoth
            </span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
              AI Dream Archive
            </span>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {NAV_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] transition-all relative py-2 ${
                activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <tab.icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  activeTab === tab.id ? 'text-dream-accent' : ''
                }`}
              />
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

        {/* User Area */}
        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Dreamer
                </p>
                <p className="text-sm font-medium text-white/80">
                  {user.displayName?.split(' ')[0]}
                </p>
              </div>
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={user.photoURL || ''}
                alt="Avatar"
                className="w-9 h-9 sm:w-11 h-11 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <button
              onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
              className="px-4 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-dream-accent hover:text-white transition-all duration-500 shadow-2xl shadow-white/5"
            >
              Begin
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
