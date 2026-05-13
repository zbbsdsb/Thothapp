import { Timestamp } from 'firebase/firestore';

// ── Firestore Operation ──────────────────────────────────────

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: Array<{
      providerId: string;
      displayName?: string | null;
      email?: string | null;
      photoUrl?: string | null;
    }>;
  };
}

// ── User ────────────────────────────────────────────────────

export interface UserProfile {
  email: string;
  created_at: Timestamp;
  daily_usage_count: number;
  daily_quota_limit: number;
  last_usage_date: string | null;
  total_dreams: number;
  active_provider: 'gemini' | 'openai' | 'deepseek' | 'minimax';
  external_apis: Record<string, string>;
  streak: number;
  last_streak_date: string | null;
}

// ── Dream ───────────────────────────────────────────────────

export interface Dream {
  id: string;
  user_id: string;
  transcript: string;
  audio_url?: string;
  tags: string[];
  insight: string;
  divine_oracle: string;
  location: string;
  created_at: Timestamp;
  // Future extension:
  // watch_recorded?: boolean;
  // audio_duration_seconds?: number;
}

// ── Global Data ──────────────────────────────────────────────

export interface GlobalImagery {
  tag: string;
  count: number;
}

export interface GlobalLocation {
  country: string;
  count: number;
}

// ── AI Response ──────────────────────────────────────────────

export interface DreamAnalysis {
  tags: string[];
  insight: string;
  divine_oracle: string;
}

// ── Payment (Common) ────────────────────────────────────────

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface PaymentResult {
  tradeState: PaymentStatus;
  transactionId?: string;
  tradeStateDesc?: string;
  outTradeNo: string;
}

// ── Payment (WeChat Pay) ─────────────────────────────────────

export interface CreateWeChatOrderParams {
  amount: number;       // Amount in CNY *cents* (100 = ¥1.00)
  title: string;       // Order title shown to user
  outTradeNo: string;  // Client-generated unique order ID
  attach?: string;     // Optional metadata (e.g. user_id)
}

export interface CreateWeChatOrderResponse {
  prepayId: string;
  nonceStr: string;
  timestamp: string;
  sign: string;
  outTradeNo: string;
}

// Keep old exports for backward compatibility
export type CreateOrderParams = CreateWeChatOrderParams;
export type CreateOrderResponse = CreateWeChatOrderResponse;

// ── Payment (Alipay) ────────────────────────────────────────

export interface CreateAlipayOrderParams {
  amount: number;       // Amount in CNY yuan (99.00 = ¥99.00)
  title: string;       // Order title shown to user
  outTradeNo: string;  // Client-generated unique order ID
  attach?: string;     // Optional metadata (e.g. user_id)
}

export interface CreateAlipayOrderResponse {
  orderStr: string;    // Signed order string for Alipay SDK
  outTradeNo: string;
}

// Alipay resultStatus codes
export type AlipayResultStatus = '9000' | '8000' | '6004' | '6001' | '6002' | '4000';

