import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Mic2,
  MicOff,
  Keyboard,
  ArrowRight,
  Info,
  Clock,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDreamActions } from '../hooks/useDreams';
import { analyzeDream } from '../lib/ai';
import type { UserProfile } from '../types';

interface RecordViewProps {
  userId: string;
  profile: UserProfile;
  userCountry: string | null;
  countdown: number | null;
  isDreamLost: boolean;
  formatCountdown: (s: number) => string;
  onCancelCountdown: () => void;
  onResetCountdown: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDreamAdded: () => void;
}

export function RecordView({
  userId,
  profile,
  userCountry,
  countdown,
  isDreamLost,
  formatCountdown,
  onCancelCountdown,
  onResetCountdown,
  isRecording,
  isTranscribing,
  onStartRecording,
  onStopRecording,
  onDreamAdded,
}: RecordViewProps) {
  const [entryMode, setEntryMode] = useState<'voice' | 'text'>('voice');
  const [manualText, setManualText] = useState('');
  const [isWatchMode, setIsWatchMode] = useState(false);
  const [hasWokenUp, setHasWokenUp] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { addDream } = useDreamActions(userId, profile);

  const handleManualSave = async () => {
    if (!manualText.trim()) return;
    onCancelCountdown();
    setIsAnalyzing(true);

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = profile.last_usage_date !== today;
    const currentUsage = isNewDay ? 0 : profile.daily_usage_count;
    const hasUserKey = !!profile.external_apis?.gemini;
    const isUsingPublicQuota = !hasUserKey;

    if (isUsingPublicQuota && currentUsage >= profile.daily_quota_limit) {
      toast.error('Daily quota reached.');
      return;
    }

    isTranscribing; // prevent unused warning
    // 使用用户自己的 Gemini key，或 fallback 到公共 key
    const apiKey = profile.external_apis?.gemini || (import.meta.env.VITE_GEMINI_API_KEY as string);

    let tags: string[] = [];
    let insight = 'Subconscious patterns detected.';
    let divine_oracle = 'The silence speaks what the words cannot.';

    try {
      const analysis = await analyzeDream(apiKey, manualText);
      tags = analysis.tags;
      insight = analysis.insight;
      divine_oracle = analysis.divine_oracle || divine_oracle;
    } catch (err) {
      if (err instanceof Error) console.warn('AI Analysis skipped:', err.message);
    }

    try {
      await addDream({
        transcript: manualText,
        tags,
        insight,
        divine_oracle,
        location: userCountry || 'Unknown',
      });
      setManualText('');
      setEntryMode('voice');
      onDreamAdded();
    } catch {
      toast.error('Failed to save dream.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      key="record"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] text-center relative"
    >
      {/* Watch Mode Simulation Overlay */}
      {isWatchMode && !hasWokenUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-dream-bg/95 backdrop-blur-3xl rounded-[60px]"
        >
          <div className="flex flex-col items-center gap-10 p-12">
            <div className="relative">
              <div className="absolute -inset-8 bg-dream-accent/20 rounded-full blur-3xl animate-pulse" />
              <div className="w-40 h-40 rounded-full border border-white/10 flex items-center justify-center relative bg-zinc-900/40">
                <Moon className="w-16 h-16 text-dream-accent/40" />
                <div className="absolute inset-0 rounded-full border-2 border-dream-accent/40 animate-ping" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-serif italic text-white tracking-tight">Deep Sleep</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">
                Monitoring Subconscious Waves
              </p>
            </div>
            <button
              onClick={() => setHasWokenUp(true)}
              className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-full overflow-hidden transition-all hover:border-dream-accent/50"
            >
              <div className="absolute inset-0 bg-dream-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative text-[10px] font-bold uppercase tracking-[0.5em] text-white/60 group-hover:text-white">
                Simulate Wake Up
              </span>
            </button>
          </div>
        </motion.div>
      )}

      <div className="mb-10 sm:mb-16 relative">
        {/* Mist overlay */}
        <AnimatePresence>
          {countdown !== null && !isDreamLost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 + (1 - countdown / 180) * 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 -z-10 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dream-bg to-dream-bg blur-3xl scale-150" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: isDreamLost ? 0.2 : 1,
            y: 0,
            filter: isDreamLost ? 'blur(8px)' : 'blur(0px)',
          }}
          transition={{ delay: 0.2, duration: 2 }}
          className="text-5xl sm:text-7xl md:text-[10rem] font-serif italic font-light tracking-tighter leading-[0.9] sm:leading-none mb-6 sm:mb-8 dream-text-gradient"
        >
          {isDreamLost ? 'The Dream has' : 'Whisper to the'} <br className="hidden sm:block" />
          <span className={isDreamLost ? 'text-white/20' : 'text-dream-accent'}>
            {isDreamLost ? 'Dissolved' : 'Subconscious'}
          </span>
        </motion.h1>

        {/* Countdown */}
        <AnimatePresence>
          {countdown !== null && !isDreamLost && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 mb-8"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-dream-accent/10 rounded-full blur-xl group-hover:bg-dream-accent/20 transition-all duration-1000" />
                <div className="relative flex items-center gap-4 px-6 py-3 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                      <motion.circle
                        cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeDasharray="88"
                        animate={{ strokeDashoffset: 88 * (1 - countdown / 180) }}
                        className="text-dream-accent"
                      />
                    </svg>
                    <Clock className="absolute w-3 h-3 text-dream-accent/60" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                      Collapse: {formatCountdown(countdown)}
                    </span>
                    <span className="text-[7px] uppercase tracking-[0.2em] text-white/20 font-bold">Signal Fading</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-white/10 italic">
                The imagery is dissolving into the void
              </p>
            </motion.div>
          )}

          {isDreamLost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 mb-8"
            >
              <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Signal Lost: This dreamscape has returned to the void
                </span>
              </div>
              <button
                onClick={() => onResetCountdown()}
                className="text-[9px] uppercase tracking-widest text-dream-accent hover:underline"
              >
                Attempt to recall fragments
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isDreamLost && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-xl text-white/30 max-w-2xl mx-auto font-light leading-relaxed px-4 sm:px-0"
          >
            Capture the ephemeral imagery of your sleep. Let the archive decode the patterns that emerge from the deep.
          </motion.p>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-8 sm:gap-12">
        {entryMode === 'voice' ? (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isTranscribing}
              className={`w-40 h-40 sm:w-48 sm:h-48 rounded-[50px] sm:rounded-[60px] flex items-center justify-center relative z-10 transition-all duration-700 shadow-2xl ${
                isRecording ? 'bg-red-500 shadow-red-500/40 rotate-12' : 'bg-dream-accent shadow-dream-accent/40'
              } ${isTranscribing ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {isRecording ? (
                <MicOff className="w-16 h-16 sm:w-20 sm:h-20 text-white animate-pulse" />
              ) : (
                <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              )}
            </motion.button>

            {isRecording && (
              <div className="absolute inset-0 z-0">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                    className="absolute inset-0 bg-red-500/20 rounded-[60px]"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl glass-card p-10"
          >
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Describe the dreamscape..."
              className="w-full h-64 bg-transparent border-none focus:ring-0 text-2xl font-serif italic font-light placeholder:text-white/10 resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20 font-bold">
                <Info className="w-3 h-3" />
                {isAnalyzing ? 'AI is analyzing...' : 'AI Analysis will be applied'}
              </div>
              <button
                onClick={handleManualSave}
                disabled={isAnalyzing || !manualText.trim()}
                className="group flex items-center gap-3 px-10 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs rounded-2xl disabled:opacity-50 transition-all hover:bg-dream-accent hover:text-white"
              >
                {isAnalyzing ? 'Analyzing...' : 'Archive'}
                {!isAnalyzing && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setEntryMode(entryMode === 'voice' ? 'text' : 'voice')}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white"
          >
            {entryMode === 'voice' ? (
              <Keyboard className="w-4 h-4" />
            ) : (
              <Mic2 className="w-4 h-4" />
            )}
            {entryMode === 'voice' ? 'Type Dream' : 'Voice Entry'}
          </button>
        </div>

        {/* Transcribing indicator */}
        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 text-dream-accent"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 16, 4] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1 bg-dream-accent rounded-full"
                />
              ))}
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Decoding Subconscious...</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
