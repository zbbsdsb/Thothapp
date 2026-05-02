import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  const baseClasses = 'glass-card p-6 sm:p-8';
  const classes = `${baseClasses} ${className}`;

  if (hoverable && onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${classes} cursor-pointer transition-all duration-500`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
};
