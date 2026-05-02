import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, Share2, Download, X } from 'lucide-react';
import type { Dream } from '../types';

interface DreamDetailModalProps {
  dream: Dream | null;
  onClose: () => void;
}

export function DreamDetailModal({ dream, onClose }: DreamDetailModalProps) {
  if (!dream) return null;

  const date = dream.created_at?.toDate().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dream-bg/95 backdrop-blur-2xl"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full sm:h-auto sm:max-w-4xl glass-card p-8 sm:p-12 overflow-y-auto sm:max-h-[90vh] rounded-none sm:rounded-[40px]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 sm:top-8 right-6 sm:right-8 p-3 hover:bg-white/5 rounded-2xl transition-colors z-10"
          >
            <X className="w-6 h-6 text-white/20" />
          </button>

          <div className="space-y-8 sm:space-y-10 pt-10 sm:pt-0">
            {/* Date */}
            <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-dream-accent">
              <Calendar className="w-4 h-4" />
              {date}
            </div>

            {/* Transcript */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
                Transcript
              </h3>
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-light leading-relaxed text-white/90">
                &ldquo;{dream.transcript}&rdquo;
              </p>
            </div>

            {/* Divine Oracle */}
            {dream.divine_oracle && (
              <div className="py-8 sm:py-12 border-y border-white/5 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-dream-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <Sparkles className="w-8 h-8 text-dream-accent/40 animate-pulse" />
                <p className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white tracking-tight max-w-2xl relative z-10">
                  {dream.divine_oracle}
                </p>
                <div className="text-[8px] uppercase tracking-[0.5em] text-dream-accent/40 font-bold">
                  The Oracle has Spoken
                </div>
              </div>
            )}

            {/* Insight + Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 pt-8 sm:pt-12">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
                  Psychological Insight
                </h3>
                <div className="p-6 sm:p-8 bg-dream-accent/5 border border-dream-accent/10 rounded-2xl sm:rounded-[32px]">
                  <p className="text-base sm:text-lg font-serif italic text-dream-accent/90 leading-relaxed">
                    {dream.insight}
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
                  Imagery Tags
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {dream.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-white/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="pt-6 sm:pt-8 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/20 font-bold">Origin</span>
                    <span className="text-xs sm:text-sm font-medium text-white/60">{dream.location}</span>
                  </div>
                  <div className="h-8 w-px bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/20 font-bold">Sync ID</span>
                    <span className="text-xs sm:text-sm font-mono text-white/40 truncate max-w-[100px]">
                      {dream.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-10 pb-10 sm:pb-0">
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
                Share Pattern
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white transition-all">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
