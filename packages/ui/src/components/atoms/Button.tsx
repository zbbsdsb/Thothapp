import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  fullWidth = false,
}) => {
  const baseClasses = 'flex items-center justify-center gap-3 transition-all duration-500 font-bold uppercase tracking-[0.2em]';
  
  const variantClasses = {
    primary: 'bg-dream-accent text-white hover:bg-dream-accent/90 shadow-2xl shadow-dream-accent/40',
    secondary: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white',
    text: 'text-white/40 hover:text-white',
    icon: 'w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-[10px] rounded-xl',
    md: 'px-8 py-4 text-xs rounded-2xl',
    lg: 'px-12 py-5 text-xs rounded-3xl',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={classes}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </motion.button>
  );
};
