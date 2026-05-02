import { motion } from 'motion/react';
import { Globe, Sparkles, Info } from 'lucide-react';
import { useDreams } from '../hooks/useDreams';
import { WorldMap } from './WorldMap';

interface GlobalViewProps {
  userId: string | undefined;
}

export function GlobalView({ userId }: GlobalViewProps) {
  const { globalImagery, globalLocations, totalUserCount } = useDreams(userId);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const totalDreams = globalLocations.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = globalLocations[0]?.count || 1;

  return (
    <motion.div
      key="global"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12"
    >
      {/* Left Column */}
      <div className="lg:col-span-7 space-y-8 sm:space-y-12">
        <div>
          <h2 className="text-5xl sm:text-7xl font-serif italic font-light tracking-tighter dream-text-gradient">
            The Collective
          </h2>
          <p className="text-white/30 uppercase tracking-[0.3em] text-[8px] sm:text-[10px] font-bold mt-4">
            Synthesized patterns from the global subconscious
          </p>
        </div>

        {/* World Map */}
        <div className="glass-card p-6 sm:p-12 relative overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-dream-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-8 sm:mb-12 flex items-center gap-4 text-white/60">
            <Globe className="w-4 h-4 sm:w-5 h-5 text-dream-accent" />
            Global Subconscious Pulse
          </h3>
          <div className="flex-1 w-full min-h-[300px]">
            <WorldMap data={globalLocations} />
          </div>
        </div>

        {/* Dominant Imagery */}
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-dream-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-12 flex items-center gap-4 text-white/60">
            <Sparkles className="w-5 h-5 text-dream-accent" />
            Dominant Imagery
          </h3>
          <div className="flex flex-wrap gap-4">
            {globalImagery.map((item, i) => (
              <motion.div
                key={item.tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl pl-5 pr-7 py-4 hover:bg-dream-accent/10 hover:border-dream-accent/20 transition-all cursor-default group"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white">
                  #{item.tag}
                </span>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-xs font-mono text-dream-accent font-bold">{item.count}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-10 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Global Sync</p>
              <h4 className="text-2xl font-serif italic font-light">Active Dreamers</h4>
            </div>
            <div className="mt-8 flex items-end justify-between">
              <div className="text-5xl font-mono font-bold tracking-tighter text-dream-accent">
                {totalUserCount.toLocaleString()}
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-1 h-4 bg-dream-accent/20 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ height: ['20%', '100%', '20%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                      className="w-full bg-dream-accent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-10 flex flex-col justify-between bg-dream-accent/5 border-dream-accent/10">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-dream-accent/40">Collective Data</p>
              <h4 className="text-2xl font-serif italic font-light">Total Archived</h4>
            </div>
            <div className="mt-8 text-6xl font-mono font-bold tracking-tighter dream-text-gradient">
              {totalDreams.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column — Dreaming Regions */}
      <div className="lg:col-span-5 space-y-12">
        <div className="glass-card p-12 h-full">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-12 flex items-center gap-4 text-white/60">
            <Globe className="w-5 h-5 text-[#4A90E2]" />
            Dreaming Regions
          </h3>

          <div className="space-y-10">
            {globalLocations.slice(0, 12).map((loc, i) => (
              <div key={loc.country} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/20">0{i + 1}</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{loc.country}</span>
                  </div>
                  <span className="text-[10px] font-mono text-dream-accent font-bold">
                    {loc.count} DREAMS
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(loc.count / maxCount) * 100}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-[#4A90E2] to-dream-accent"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t border-white/5">
            <div className="flex items-start gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
              <Info className="w-5 h-5 text-white/20 mt-1" />
              <p className="text-[10px] leading-relaxed text-white/30 uppercase tracking-widest font-medium">
                Location data is synthesized anonymously to map global subconscious trends without
                compromising individual dreamer privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
