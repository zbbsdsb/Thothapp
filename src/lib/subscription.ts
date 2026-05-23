import ThothBilling, {
  type PurchaseResult,
  type ProductDetail,
} from './google-play-billing';

// ── Configuration ─────────────────────────────────────────────

const PAYMENT_SERVER_URL = import.meta.env.VITE_PAYMENT_SERVER_URL ?? '';

// ── Product IDs (must match Play Console configuration) ──────

export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'thoth_premium_monthly',
  PREMIUM_YEARLY: 'thoth_premium_yearly',
  CREDITS_10: 'thoth_credits_10',
  CREDITS_50: 'thoth_credits_50',
} as const;

// ── Error Types ───────────────────────────────────────────────

export class BillingError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly responseCode?: number,
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

// ── Core Functions ────────────────────────────────────────────

/**
 * Initialize the billing client. Must be called before any other billing operations.
 */
export async function initializeBilling(): Promise<boolean> {
  try {
    const result = await ThothBilling.initialize();
    return result.connected;
  } catch (err) {
    throw new BillingError(
      `Failed to initialize billing: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Query available subscription products from Google Play.
 */
export async function querySubscriptionProducts(): Promise<ProductDetail[]> {
  try {
    const result = await ThothBilling.queryProducts({
      productIds: [PRODUCT_IDS.PREMIUM_MONTHLY, PRODUCT_IDS.PREMIUM_YEARLY],
      type: 'subs',
    });
    return result.products;
  } catch (err) {
    throw new BillingError(
      `Failed to query subscription products: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Query available consumable credit products from Google Play.
 */
export async function queryCreditProducts(): Promise<ProductDetail[]> {
  try {
    const result = await ThothBilling.queryProducts({
      productIds: [PRODUCT_IDS.CREDITS_10, PRODUCT_IDS.CREDITS_50],
      type: 'inapp',
    });
    return result.products;
  } catch (err) {
    throw new BillingError(
      `Failed to query credit products: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Purchase a subscription and verify it on the backend.
 *
 * @param productId - The subscription product ID
 * @param userId - The current user's Firebase UID
 * @returns Verification result from the backend
 */
export async function purchaseSubscription(
  productId: string,
  userId: string,
): Promise<SubscriptionVerifyResult> {
  // 1. Query product details to get the offer token
  const { products } = await ThothBilling.queryProducts({
    productIds: [productId],
    type: 'subs',
  });

  if (!products.length) {
    throw new BillingError(`Subscription product not found: ${productId}`);
  }

  const offerToken = products[0].subscriptionOfferDetails?.[0]?.offerToken;
  if (!offerToken) {
    throw new BillingError('No subscription offer available');
  }

  // 2. Launch the billing flow
  const purchase = await ThothBilling.purchase({
    productId,
    offerToken,
    obfuscatedAccountId: userId,
  });

  if (!purchase.success) {
    if (purchase.cancelled) {
      throw new BillingError('Purchase was cancelled by the user', 'CANCELLED');
    }
    throw new BillingError(
      purchase.errorMessage ?? 'Purchase failed',
      purchase.responseCode?.toString(),
    );
  }

  // 3. Handle pending purchases
  if (purchase.pending) {
    return {
      verified: false,
      pending: true,
      message: 'Purchase is pending. You will receive access once payment is confirmed.',
    };
  }

  // 4. Send to backend for server-side verification
  return verifyPurchaseWithBackend(purchase, userId);
}

/**
 * Purchase consumable credits and verify on the backend.
 *
 * @param productId - The credit product ID (e.g., thoth_credits_10)
 * @param userId - The current user's Firebase UID
 * @returns Verification result from the backend
 */
export async function purchaseCredits(
  productId: string,
  userId: string,
): Promise<CreditsVerifyResult> {
  // 1. Launch the billing flow (no offerToken needed for one-time products)
  const purchase = await ThothBilling.purchase({
    productId,
    offerToken: '', // Empty for consumable products
    obfuscatedAccountId: userId,
  });

  if (!purchase.success) {
    if (purchase.cancelled) {
      throw new BillingError('Purchase was cancelled by the user', 'CANCELLED');
    }
    throw new BillingError(
      purchase.errorMessage ?? 'Purchase failed',
      purchase.responseCode?.toString(),
    );
  }

  if (purchase.pending) {
    return {
      verified: false,
      pending: true,
      message: 'Purchase is pending. Credits will be added once payment is confirmed.',
    };
  }

  // 2. Send to backend for verification and consumption
  return verifyCreditsWithBackend(purchase, userId);
}

/**
 * Restore previously purchased subscriptions.
 * Call this on app launch or when the user taps "Restore Purchases".
 */
export async function restorePurchases(
  userId: string,
): Promise<RestoreResult> {
  try {
    const { purchases } = await ThothBilling.getPurchases();

    if (!purchases.length) {
      return { restored: false, message: 'No previous purchases found' };
    }

    // Verify each purchase with the backend
    const results: PurchaseResult[] = [];
    for (const purchase of purchases) {
      try {
        await verifyPurchaseWithBackend(purchase, userId);
        results.push(purchase);
      } catch {
        // Skip failed verifications (expired, revoked, etc.)
        console.warn(`Failed to restore purchase: ${purchase.orderId}`);
      }
    }

    return {
      restored: results.length > 0,
      purchases: results,
      message: results.length > 0
        ? `Restored ${results.length} purchase(s)`
        : 'No valid purchases to restore',
    };
  } catch (err) {
    throw new BillingError(
      `Failed to restore purchases: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// ── Backend Verification Helpers ─────────────────────────────

interface SubscriptionVerifyResult {
  verified: boolean;
  tier?: string;
  planId?: string;
  expiryDate?: string;
  pending?: boolean;
  message?: string;
}

interface CreditsVerifyResult {
  verified: boolean;
  creditsAdded?: number;
  newBalance?: number;
  pending?: boolean;
  message?: string;
}

interface RestoreResult {
  restored: boolean;
  purchases?: PurchaseResult[];
  message: string;
}

async function verifyPurchaseWithBackend(
  purchase: PurchaseResult,
  userId: string,
): Promise<SubscriptionVerifyResult> {
  const res = await fetch(`${PAYMENT_SERVER_URL}/api/google-play/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purchaseToken: purchase.purchaseToken,
      productId: purchase.productId,
      orderId: purchase.orderId,
      userId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verification failed' }));
    throw new BillingError(err.error ?? `Server error: HTTP ${res.status}`);
  }

  return res.json();
}

async function verifyCreditsWithBackend(
  purchase: PurchaseResult,
  userId: string,
): Promise<CreditsVerifyResult> {
  const res = await fetch(`${PAYMENT_SERVER_URL}/api/google-play/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purchaseToken: purchase.purchaseToken,
      productId: purchase.productId,
      orderId: purchase.orderId,
      userId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verification failed' }));
    throw new BillingError(err.error ?? `Server error: HTTP ${res.status}`);
  }

  return res.json();
}
