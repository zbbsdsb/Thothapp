// AI Services
export * from './ai';

// Data Services
export * from './data';

// Auth Services
export * from './auth';

// Storage Services
export * from './storage';

// Utilities
export * from './utils';

// Types
export interface UserProfile {
  email: string;
  created_at: any; // Timestamp
  daily_usage_count: number;
  daily_quota_limit: number;
  last_usage_date: string | null;
  total_dreams: number;
  active_provider: 'gemini' | 'openai' | 'deepseek' | 'minimax';
  external_apis: {
    [key: string]: string;
  };
  streak: number;
  last_streak_date: string | null;
}

export interface Dream {
  id: string;
  user_id: string;
  transcript: string;
  audio_url?: string;
  tags: string[];
  insight: string;
  divine_oracle: string;
  location: string;
  created_at: any; // Timestamp
}

export interface DreamCreate {
  user_id: string;
  transcript: string;
  audio_url?: string;
  tags: string[];
  insight: string;
  divine_oracle: string;
  location: string;
}

export interface DreamAnalysis {
  tags: string[];
  insight: string;
  divine_oracle: string;
}

export interface GlobalImagery {
  tag: string;
  count: number;
  last_updated: any; // Timestamp
}

export interface GlobalLocation {
  country: string;
  count: number;
  last_updated: any; // Timestamp
}

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
  authInfo: any;
}
