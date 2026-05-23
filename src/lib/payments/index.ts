import { Capacitor } from '@capacitor/core';

// ── Payment Provider Types ───────────────────────────────────

export type PaymentProvider = 'google_play' | 'wechat' | 'alipay';

export interface PaymentProviderInfo {
  provider: PaymentProvider;
  label: string;
  available: boolean;
}

// ── Provider Detection ───────────────────────────────────────

/**
 * Detect the appropriate payment provider based on the current platform and locale.
 * - Android native: Google Play Billing
 * - Chinese locale (web): WeChat Pay
 * - Other locales (web): No provider available (consider Stripe in the future)
 */
export function detectPaymentProvider(): PaymentProvider {
  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  if (isAndroid) {
    return 'google_play';
  }

  const locale = navigator.language;
  if (locale.startsWith('zh')) {
    return 'wechat';
  }

  throw new Error('No payment provider available on this platform');
}

/**
 * Get all available payment providers for the current context.
 */
export function getAvailableProviders(): PaymentProviderInfo[] {
  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const locale = navigator.language;
  const isChinese = locale.startsWith('zh');

  const providers: PaymentProviderInfo[] = [];

  if (isAndroid) {
    providers.push({
      provider: 'google_play',
      label: 'Google Play',
      available: true,
    });
  }

  if (isChinese) {
    providers.push({
      provider: 'wechat',
      label: 'WeChat Pay',
      available: true,
    });
    providers.push({
      provider: 'alipay',
      label: 'Alipay',
      available: true,
    });
  }

  return providers;
}

// ── Provider Labels ──────────────────────────────────────────

export const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  google_play: 'Google Play',
  wechat: 'WeChat Pay',
  alipay: 'Alipay',
};
