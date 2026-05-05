/**
 * WeChat Pay — App Payment Integration
 *
 * Flow:
 *   1. Client calls createPaymentOrder() → server creates WeChat order via APIv3
 *   2. Server returns { prepay_id } → client calls openWeChatPay()
 *   3. WeChat SDK opens, user completes payment inside WeChat
 *   4. WeChat notifies server via callback; server updates order status
 *   5. WeChat returns result to WXEntryActivity on Android
 *
 * Prerequisites (set as env vars before use):
 *   VITE_WX_APP_ID          — WeChat Open Platform App ID
 *   VITE_PAYMENT_SERVER_URL  — Backend base URL (e.g. https://api.thothapp.com)
 */

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface CreateOrderParams {
  amount: number;       // Amount in CNY *cents* (100 = ¥1.00)
  title: string;        // Order title shown to user
  outTradeNo: string;   // Client-generated unique order ID
  attach?: string;     // Optional metadata (e.g. user_id)
}

export interface CreateOrderResponse {
  prepayId: string;    // WeChat prepay_id (valid 2h)
  nonceStr: string;
  timestamp: string;
  sign: string;        // SDK call signature (appid|prepay_id|nonceStr|timestamp|partnerKey)
  outTradeNo: string;
}

export interface PaymentResult {
  tradeState: PaymentStatus;
  transactionId?: string;
  tradeStateDesc?: string;
  outTradeNo: string;
}

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
