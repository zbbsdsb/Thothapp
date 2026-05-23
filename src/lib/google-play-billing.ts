import { registerPlugin } from '@capacitor/core';

// ── Plugin Interface ─────────────────────────────────────────

export interface ThothBillingPlugin {
  initialize(): Promise<InitializeResult>;
  queryProducts(options: QueryProductsOptions): Promise<QueryProductsResult>;
  purchase(options: PurchaseOptions): Promise<PurchaseResult>;
  consumePurchase(options: ConsumeOptions): Promise<ConsumeResult>;
  getPurchases(): Promise<GetPurchasesResult>;
  acknowledgePurchase(options: AcknowledgeOptions): Promise<AcknowledgeResult>;
}

// ── Request/Response Types ────────────────────────────────────

export interface InitializeResult {
  connected: boolean;
}

export interface QueryProductsOptions {
  productIds: string[];
  type: 'inapp' | 'subs';
}

export interface QueryProductsResult {
  products: ProductDetail[];
}

export interface PurchaseOptions {
  productId: string;
  offerToken: string;
  obfuscatedAccountId?: string;
  obfuscatedProfileId?: string;
}

export interface ConsumeOptions {
  purchaseToken: string;
}

export interface AcknowledgeOptions {
  purchaseToken: string;
}

// ── Product Detail Types ─────────────────────────────────────

export interface ProductDetail {
  productId: string;
  title: string;
  description: string;
  productType: string;
  subscriptionOfferDetails?: SubscriptionOfferDetail[];
  oneTimePurchaseOfferDetails?: OneTimePurchaseOfferDetails;
}

export interface OneTimePurchaseOfferDetails {
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
}

export interface SubscriptionOfferDetail {
  offerId: string;
  offerToken: string;
  basePlanId: string;
  pricingPhases: PricingPhase[];
}

export interface PricingPhase {
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
  billingPeriod: string;
  recurrenceMode: number;
  billingCycleCount: number;
}

// ── Purchase Result Types ────────────────────────────────────

export interface PurchaseResult {
  success: boolean;
  purchaseToken: string;
  productId: string;
  orderId: string;
  purchaseState: number;
  acknowledgementState: number;
  autoRenewing: boolean;
  packageName: string;
  purchaseTime: number;
  signature?: string;
  pending?: boolean;
  cancelled?: boolean;
  errorMessage?: string;
  responseCode?: number;
  debugMessage?: string;
}

export interface ConsumeResult {
  success: boolean;
  purchaseToken: string;
}

export interface AcknowledgeResult {
  success: boolean;
  purchaseToken: string;
}

export interface GetPurchasesResult {
  purchases: PurchaseResult[];
}

// ── Plugin Registration ───────────────────────────────────────

const ThothBilling = registerPlugin<ThothBillingPlugin>('ThothBilling');

export default ThothBilling;
