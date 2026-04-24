import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thoth.dreamarchive',
  appName: 'Thoth',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0a0a0f',
    allowsLinkPreview: false,
  },
  android: {
    // Allow mixed content (R2 HTTP upload fallback)
    allowMixedContent: true,
    // Match Web dark theme background
    backgroundColor: '#0a0a0f',
    // Custom User-Agent for server-side identification
    overrideUserAgent: 'ThothApp/Android',
    // Use HTTPS scheme for the web view
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0f',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f',
      overlaysWebView: false,
    },
  },
};

export default config;
