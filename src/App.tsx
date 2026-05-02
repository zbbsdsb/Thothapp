import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Clock, Moon } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { useAuth } from './hooks/useAuth';
import { useDreams } from './hooks/useDreams';
import { useRecording } from './hooks/useRecording';
import { useCountdown } from './hooks/useCountdown';

import { Navigation } from './components/Navigation';
import { TabBar } from './components/TabBar';
import { RecordView } from './components/RecordView';
import { HistoryView } from './components/HistoryView';
import { GlobalView } from './components/GlobalView';
import { SettingsView } from './components/SettingsView';
import { DreamDetailModal } from './components/DreamDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { Dream } from './types';

type Tab = 'record' | 'history' | 'global' | 'settings';

export default function App() {
  const { user, profile, loading } = useAuth();
  const { dreams } = useDreams(user?.uid);

  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [dreamToDelete, setDreamToDelete] = useState<Dream | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  // Fetch user country on mount
  useState(() => {
    if (!user) return;
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => setUserCountry(d.country_name || 'Unknown'))
      .catch(() => setUserCountry('Unknown'));
  });

  // Countdown — active only on record tab
  const {
    countdown,
    isDreamLost,
    reset: resetCountdown,
    cancel: cancelCountdown,
    format: formatCountdown,
  } = useCountdown(activeTab === 'record');

  // Recording
  const { isRecording, isTranscribing, startRecording, stopRecording } = useRecording({
    userId: user?.uid,
    profile,
    userCountry,
    hasUserKey: !!profile?.external_apis?.minimax,
    onDreamAdded: () => {},
  });

  // Delete confirmation
  const handleDeleteConfirm = async () => {
    if (!dreamToDelete || !user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { total_dreams: -1 });
      toast.success('Dream deleted successfully.');
    } catch {
      toast.error('Failed to delete dream.');
    } finally {
      setDreamToDelete(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dream-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-dream-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-white/30 text-xs uppercase tracking-widest">Connecting to the archive...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mx-auto">
            <Moon className="w-10 h-10 text-dream-accent" />
          </div>
          <h1 className="text-4xl font-serif italic dream-text-gradient">Thoth</h1>
          <p className="text-white/30 text-xs uppercase tracking-widest">AI Dream Archive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-dream-accent selection:text-white">
      <Toaster position="top-center" theme="dark" />
      <div className="atmosphere" />

      <Navigation user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="pt-32 sm:pt-40 pb-32 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'record' && (
            <RecordView
              userId={user.uid}
              profile={profile!}
              userCountry={userCountry}
              countdown={countdown}
              isDreamLost={isDreamLost}
              formatCountdown={formatCountdown}
              onCancelCountdown={cancelCountdown}
              onResetCountdown={resetCountdown}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onDreamAdded={() => {}}
            />
          )}
          {activeTab === 'history' && (
            <HistoryView
              userId={user.uid}
              profile={profile!}
              onSelectDream={setSelectedDream}
            />
          )}
          {activeTab === 'global' && <GlobalView userId={user.uid} />}
          {activeTab === 'settings' && <SettingsView user={user} profile={profile!} />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="hidden sm:block fixed bottom-0 left-0 right-0 z-40 bg-dream-bg/40 backdrop-blur-2xl border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
              <span className="text-white/40">Collective Sync Active</span>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })} UTC
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-white/10">Quota Status</span>
              <span
                className={`px-2 py-0.5 rounded-md ${
                  (profile?.daily_usage_count || 0) >= (profile?.daily_quota_limit || 3)
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-dream-accent/20 text-dream-accent'
                }`}
              >
                {profile?.daily_usage_count || 0} / {profile?.daily_quota_limit || 3}
              </span>
            </div>
            <span className="text-white/5">|</span>
            <span className="text-white/40 italic font-serif lowercase tracking-normal text-xs">
              Thoth v1.0.8 — Powered by dreambase
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DreamDetailModal dream={selectedDream} onClose={() => setSelectedDream(null)} />
      <DeleteConfirmModal
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDreamToDelete(null)}
      />
    </div>
  );
}
