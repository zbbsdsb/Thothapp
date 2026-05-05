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

// ── Payment (WeChat Pay) ─────────────────────────────────────

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface CreateOrderParams {
  amount: number;       // Amount in CNY *cents* (100 = ¥1.00)
  title: string;       // Order title shown to user
  outTradeNo: string;  // Client-generated unique order ID
  attach?: string;     // Optional metadata (e.g. user_id)
}

export interface CreateOrderResponse {
  prepayId: string;
  nonceStr: string;
  timestamp: string;
  sign: string;
  outTradeNo: string;
}

export interface PaymentResult {
  tradeState: PaymentStatus;
  transactionId?: string;
  tradeStateDesc?: string;
  outTradeNo: string;
}
