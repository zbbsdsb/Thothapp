import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-dream-bg/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm glass-card p-8 sm:p-10 relative z-10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-serif italic text-white mb-4">Dissolve this memory?</h3>
          <p className="text-sm text-white/40 mb-8 leading-relaxed">
            This dream will be returned to the void. This action cannot be reversed.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-600 transition-colors"
            >
              Confirm Dissolution
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 bg-white/5 text-white/60 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-colors"
            >
              Keep Fragment
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
