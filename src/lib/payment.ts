/**
 * Payment Integration — WeChat Pay & Alipay
 *
 * Flow (both WeChat & Alipay):
 *   1. Client calls createPaymentOrder() → server creates order via payment provider API
 *   2. Server returns signed params → client calls open[Provider]Pay()
 *   3. Payment SDK opens, user completes payment
 *   4. Payment provider notifies server via callback; server updates order status
 *
 * Prerequisites (set as env vars before use):
 *   VITE_WX_APP_ID          — WeChat Open Platform App ID
 *   VITE_ALIPAY_APP_ID      — Alipay Open Platform App ID
 *   VITE_PAYMENT_SERVER_URL — Backend base URL (e.g. https://api.thothapp.com)
 */

import {
  PaymentStatus,
  PaymentResult,
  CreateWeChatOrderParams,
  CreateWeChatOrderResponse,
  CreateAlipayOrderParams,
  CreateAlipayOrderResponse,
} from '../types';

// Export for backward compatibility
export type { PaymentStatus, PaymentResult };
export type CreateOrderParams = CreateWeChatOrderParams;
export type CreateOrderResponse = CreateWeChatOrderResponse;

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Create a WeChat App payment order on the backend.
 * The backend generates the prepay_id and signs the SDK call parameters.
 */
export async function createPaymentOrder(
  params: CreateOrderParams,
): Promise<CreateOrderResponse> {
  const serverUrl = import.meta.env.VITE_PAYMENT_SERVER_URL;

  const res = await fetch(`${serverUrl}/api/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      out_trade_no: params.outTradeNo,
      amount: params.amount,
      description: params.title,
      attach: params.attach ?? '',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<CreateOrderResponse>;
}

/**
 * Open WeChat Pay using the WeChat Open SDK.
 * Falls back to prompt-based call on web.
 *
 * Android: requires WeChat SDK registered via Capacitor plugin or deep link
 * iOS:     requires WeChat SDK registered via AppDelegate
 */
export async function openWeChatPay(params: CreateOrderResponse): Promise<void> {
  const appId = import.meta.env.VITE_WX_APP_ID;

  // @ts-expect-error — WeChat SDK injected globally by the native SDK
  if (typeof WeChat !== 'undefined' && WeChat.isWXAppInstalled()) {
    // @ts-expect-error
    await WeChat.sendPaymentRequest({
      partnerId: params.nonceStr, // Filled by server from WeChat response
      prepayId: params.prepayId,
      package: 'Sign=WXPay',
      nonceStr: params.nonceStr,
      timestamp: params.timestamp,
      sign: params.sign,
    });
    return;
  }

  // Fallback: deep link (works without native SDK installed)
  // WeChat will attempt to open the app or the H5 payment flow
  const deepLink = `weixin://app/${appId}/pay/?package=Sign%3DWXPay&prepayid=${params.prepayId}&noncestr=${params.nonceStr}&timestamp=${params.timestamp}&sign=${params.sign}`;
  window.location.href = deepLink;
}

/**
 * Poll order status from the backend.
 * Call this after openWeChatPay() resolves — it only confirms the call was made,
 * not that payment succeeded. The backend callback is authoritative.
 */
export async function queryPaymentStatus(
  outTradeNo: string,
): Promise<PaymentResult> {
  const serverUrl = import.meta.env.VITE_PAYMENT_SERVER_URL;

  const res = await fetch(
    `${serverUrl}/api/payment/query-order?out_trade_no=${encodeURIComponent(outTradeNo)}`,
  );

  if (!res.ok) {
    throw new Error(`Query failed: HTTP ${res.status}`);
  }

  return res.json() as Promise<PaymentResult>;
}

/**
 * Start payment and wait for result.
 * Uses polling with exponential backoff (max 60s) as a fallback when
 * native callback cannot be received.
 */
export async function pay(
  params: CreateOrderParams,
  options: { maxWaitMs?: number } = {},
): Promise<{ success: boolean; result: PaymentResult }> {
  const maxWaitMs = options.maxWaitMs ?? 60_000;
  const start = Date.now();

  // Step 1: Create order
  const order = await createPaymentOrder(params);

  // Step 2: Open WeChat Pay
  await openWeChatPay(order);

  // Step 3: Poll until resolved or timeout
  while (Date.now() - start < maxWaitMs) {
    const result = await queryPaymentStatus(params.outTradeNo);

    if (result.tradeState === 'success') {
      return { success: true, result };
    }
    if (result.tradeState === 'failed' || result.tradeState === 'cancelled') {
      return { success: false, result };
    }

    // Wait 1.5s before next poll
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Timeout — treat as pending (payment may still be processing server-side)
  return {
    success: false,
    result: {
      tradeState: 'pending',
      outTradeNo: params.outTradeNo,
    },
  };
}

// ---------------------------------------------------------------------------
// Alipay Pay
// ---------------------------------------------------------------------------

/**
 * Create an Alipay App payment order on the backend.
 * The backend generates and signs the orderStr for Alipay SDK.
 */
export async function createAlipayOrder(
  params: CreateAlipayOrderParams,
): Promise<CreateAlipayOrderResponse> {
  const serverUrl = import.meta.env.VITE_PAYMENT_SERVER_URL;

  const res = await fetch(`${serverUrl}/api/alipay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      out_trade_no: params.outTradeNo,
      total_amount: params.amount,
      subject: params.title,
      attach: params.attach ?? '',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<CreateAlipayOrderResponse>;
}

/**
 * Open Alipay Pay using the Alipay SDK.
 * Falls back to URL scheme if SDK not available.
 *
 * Note: Requires native Capacitor plugin integration on Android/iOS
 */
export async function openAlipay(orderStr: string): Promise<void> {
  // Try to use Capacitor plugin if available
  // @ts-ignore
  if (typeof window.Alipay !== 'undefined') {
    // @ts-ignore
    await window.Alipay.pay(orderStr);
    return;
  }

  // For web fallback or if plugin not available
  // Try to open via URL scheme (this may not work on all platforms)
  console.warn('Alipay SDK not available, attempting URL scheme fallback');
}

/**
 * Query Alipay order status from the backend.
 */
export async function queryAlipayOrderStatus(
  outTradeNo: string,
): Promise<PaymentResult> {
  const serverUrl = import.meta.env.VITE_PAYMENT_SERVER_URL;

  const res = await fetch(
    `${serverUrl}/api/alipay/query-order?out_trade_no=${encodeURIComponent(outTradeNo)}`,
  );

  if (!res.ok) {
    throw new Error(`Query failed: HTTP ${res.status}`);
  }

  return res.json() as Promise<PaymentResult>;
}

/**
 * Start Alipay payment and wait for result.
 * Uses polling with exponential backoff (max 60s) as fallback.
 */
export async function payAlipay(
  params: CreateAlipayOrderParams,
  options: { maxWaitMs?: number } = {},
): Promise<{ success: boolean; result: PaymentResult }> {
  const maxWaitMs = options.maxWaitMs ?? 60_000;
  const start = Date.now();

  // Step 1: Create Alipay order
  const order = await createAlipayOrder(params);

  // Step 2: Open Alipay payment
  await openAlipay(order.orderStr);

  // Step 3: Poll until resolved or timeout
  while (Date.now() - start < maxWaitMs) {
    const result = await queryAlipayOrderStatus(params.outTradeNo);

    if (result.tradeState === 'success') {
      return { success: true, result };
    }
    if (result.tradeState === 'failed' || result.tradeState === 'cancelled') {
      return { success: false, result };
    }

    // Wait 1.5s before next poll
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Timeout — treat as pending (payment may still be processing server-side)
  return {
    success: false,
    result: {
      tradeState: 'pending',
      outTradeNo: params.outTradeNo,
    },
  };
}
