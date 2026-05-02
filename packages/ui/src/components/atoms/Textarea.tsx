import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 transition-all duration-500 focus:outline-none focus:border-dream-accent focus:ring-1 focus:ring-dream-accent text-white placeholder:text-white/20 resize-none ${className}`}
      />
      {error && (
        <p className="mt-2 text-xs text-red-500/80 font-bold uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
    </div>
  );
};
