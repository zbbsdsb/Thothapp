import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Calendar,
  MapPin,
  Trash2,
  Wind,
} from 'lucide-react';
import { useDreams, useDreamActions } from '../hooks/useDreams';
import type { Dream, UserProfile } from '../types';

interface HistoryViewProps {
  userId: string;
  profile: UserProfile;
  onSelectDream: (dream: Dream | null) => void;
  onDeleteClick?: (dream: Dream) => void;
}

export function HistoryView({ userId, profile, onSelectDream, onDeleteClick }: HistoryViewProps) {
  const { dreams } = useDreams(userId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDreams = useMemo(() => {
    return dreams.filter(
      (d) =>
        d.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [dreams, searchQuery]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const hasUnrecordedDream = profile.last_usage_date !== new Date().toISOString().split('T')[0];

  return (
    <motion.div
      key="history"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="space-y-10 sm:space-y-16"
    >
      {/* Unrecorded Night Alert */}
      {hasUnrecordedDream && dreams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-10 glass-card bg-red-500/5 border-red-500/10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-all duration-1000" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Wind className="w-8 h-8 text-red-500/40 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-serif italic text-red-500/80">Unconscious Noise Detected</h4>
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
                  You had an unrecorded dream last night. It is dissolving into the void.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
        <div>
          <h2 className="text-5xl sm:text-7xl font-serif italic font-light tracking-tighter dream-text-gradient">
            The Archive
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
              Your personal subconscious library
            </span>
            <div className="hidden sm:block h-px w-20 bg-white/10" />
            <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-dream-accent font-bold">
              {dreams.length} Dreams
            </span>
          </div>
        </div>
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-white/20" />
          <input
            type="text"
            placeholder="Search imagery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-card bg-white/[0.03] border-white/5 rounded-xl sm:rounded-2xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 sm:pr-8 focus:border-dream-accent/50 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Dream Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        {filteredDreams.map((dream) => (
          <motion.div
            layout
            key={dream.id}
            variants={fadeInUp}
            onClick={() => onSelectDream(dream)}
            className="group glass-card p-8 sm:p-10 hover:bg-white/[0.07] transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full"
          >
            {/* Delete button */}
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick?.(dream);
                }}
                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              <Calendar className="w-3.5 h-3.5 text-dream-accent" />
              {dream.created_at?.toDate().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              <span className="mx-2 opacity-30">|</span>
              <MapPin className="w-3.5 h-3.5" />
              {dream.location}
            </div>

            {/* Transcript */}
            <p className="text-xl font-serif italic font-light leading-relaxed mb-10 line-clamp-4 text-white/70 group-hover:text-white transition-colors">
              &ldquo;{dream.transcript}&rdquo;
            </p>

            {/* Tags + Insight */}
            <div className="mt-auto space-y-6">
              <div className="flex flex-wrap gap-2">
                {dream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white/30 group-hover:text-dream-accent group-hover:border-dream-accent/20 transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="pt-6 border-t border-white/5">
                <p className="text-xs italic font-serif text-white/40 group-hover:text-dream-accent/80 leading-relaxed transition-colors">
                  {dream.insight}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredDreams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-white/10" />
          </div>
          <p className="text-white/20 uppercase tracking-[0.3em] text-xs font-bold">
            No matching imagery found in the archive
          </p>
        </div>
      )}
    </motion.div>
  );
}
