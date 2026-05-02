export const theme = {
  colors: {
    dreamBg: '#0a0502',
    dreamAccent: '#ff4e00',
    white: '#ffffff',
    white05: 'rgba(255, 255, 255, 0.05)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    white40: 'rgba(255, 255, 255, 0.4)',
    white50: 'rgba(255, 255, 255, 0.5)',
    white80: 'rgba(255, 255, 255, 0.8)',
    zinc300: '#d4d4d8',
    zinc500: '#71717a',
    zinc900: '#18181b',
    zinc950: '#09090b',
    red500: '#ef4444',
  },
  fonts: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    serif: '"Cormorant Garamond", serif',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  animation: {
    drift: 'drift 30s ease-in-out infinite alternate',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    ping: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
  },
};

export type Theme = typeof theme;
