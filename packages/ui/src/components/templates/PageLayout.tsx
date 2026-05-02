import React from 'react';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="min-h-screen selection:bg-dream-accent selection:text-white">
      {/* Immersive Atmosphere */}
      <div className="atmosphere" />

      {/* Main Viewport */}
      <main className={`pt-32 sm:pt-40 pb-32 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 ${className}`}>
        {children}
      </main>
    </div>
  );
};
