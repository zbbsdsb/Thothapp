import { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Zap, Moon, LogOut } from 'lucide-react';
import { signOut as firebaseSignOut, User } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types';

interface SettingsViewProps {
  user: User;
  profile: UserProfile;
}

export function SettingsView({ user, profile }: SettingsViewProps) {
  const [isWatchMode, setIsWatchMode] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const hasUserKey = !!profile.external_apis?.gemini;
  const remainingQuota = Math.max(0, profile.daily_quota_limit - profile.daily_usage_count);
  const memberSince = profile.created_at?.toDate().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handleKeyChange = async (value: string) => {
    await updateDoc(doc(db, 'users', user.uid), {
      'external_apis.gemini': value,
    });
  };

  return (
    <motion.div
      key="settings"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto space-y-10 sm:space-y-16"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl sm:text-7xl font-serif italic font-light tracking-tighter dream-text-gradient">
          Interface
        </h2>
        <p className="text-white/30 uppercase tracking-[0.3em] text-[8px] sm:text-[10px] font-bold mt-4">
          Configure your subconscious connection
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Identity Stats */}
        <div className="glass-card p-8 sm:p-12">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-8 sm:mb-10 flex items-center gap-4 text-white/60">
            <UserIcon className="w-4 h-4 sm:w-5 h-5 text-dream-accent" />
            Dreamer Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-2">Total Archived</p>
              <p className="text-3xl font-mono font-bold text-white/80">{profile.total_dreams || 0}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-2">Current Streak</p>
              <p className="text-3xl font-mono font-bold text-dream-accent">
                {profile.streak || 0}{' '}
                <span className="text-xs uppercase tracking-widest">Days</span>
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-2">Member Since</p>
              <p className="text-xl font-mono font-bold text-white/60">{memberSince}</p>
            </div>
          </div>
        </div>

        {/* AI Synthesis */}
        <div className="glass-card p-12">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-white/60">
            <Zap className="w-5 h-5 text-dream-accent" />
            AI Synthesis
          </h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Gemini API Key
                </label>
                <span className="text-[9px] text-white/20 italic">Optional: Removes public quota</span>
              </div>
              <input
                type="password"
                placeholder="Enter your private key..."
                defaultValue={profile.external_apis?.gemini || ''}
                onChange={(e) => handleKeyChange(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 focus:border-dream-accent/50 outline-none transition-all font-mono text-sm"
              />
            </div>

            <div className="p-6 bg-dream-accent/5 border border-dream-accent/10 rounded-2xl flex items-start gap-4">
              <Zap className="w-5 h-5 text-dream-accent mt-1" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-dream-accent">
                  {hasUserKey ? 'Private Key Active' : 'Public Quota Active'}
                </p>
                <p className="text-[10px] leading-relaxed text-white/40 uppercase tracking-widest">
                  {hasUserKey
                    ? 'Your private key is being used for all dream analysis.'
                    : `You are currently using the public Gemini 3.1 Flash quota. Remaining today: ${remainingQuota} dreams.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Watch Mode */}
        <div className="glass-card p-12">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-white/60">
            <Moon className="w-5 h-5 text-dream-accent" />
            Watch Mode (Experimental)
          </h3>
          <div className="flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-3xl">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white">
                Enable Watch Interface
              </p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                Optimize UI for circular displays and wake-up detection
              </p>
            </div>
            <button
              onClick={() => setIsWatchMode((v) => !v)}
              className={`w-14 h-7 rounded-full transition-all relative ${isWatchMode ? 'bg-dream-accent' : 'bg-white/10'}`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-lg ${isWatchMode ? 'left-8' : 'left-1'}`}
              />
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="flex gap-4">
          <button
            onClick={() => firebaseSignOut(auth)}
            className="flex-1 py-5 bg-red-500/5 text-red-500 border border-red-500/10 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            Terminate Connection
          </button>
        </div>
      </div>
    </motion.div>
  );
}
