import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
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
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-${icon ? '12' : '6'} transition-all duration-500 focus:outline-none focus:border-dream-accent focus:ring-1 focus:ring-dream-accent text-white placeholder:text-white/20 ${className}`}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500/80 font-bold uppercase tracking-[0.1em]">
          {error}
        </p>
      )}
    </div>
  );
};
