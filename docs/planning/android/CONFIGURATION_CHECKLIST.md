# Thothapp Configuration Checklist

This document consolidates all configuration items, environment variables, and TODO items that require attention before production deployment.

---

## 1. Environment Variables

### 1.1 Server Configuration

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `PORT` | No | `3000` | Server listen port | `server.ts:120` |
| `NODE_ENV` | No | - | Environment mode (`development`/`production`) | `server.ts:1068` |
| `CORS_ORIGINS` | Yes | - | Comma-separated allowed origins | `server.ts:87-88` |

### 1.2 Cloudflare R2 Storage

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `R2_ENDPOINT` | Yes | - | R2 endpoint URL | `server.ts:139` |
| `R2_ACCESS_KEY_ID` | Yes | `""` | R2 access key ID | `server.ts:141` |
| `R2_SECRET_ACCESS_KEY` | Yes | `""` | R2 secret access key | `server.ts:142` |
| `R2_BUCKET_NAME` | Yes | - | R2 bucket name | `server.ts:1049` |
| `R2_PUBLIC_URL` | No | - | Public URL for R2 assets | `server.ts:1056` |

### 1.3 WeChat Pay (China Market)

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `WX_MCHID` | Yes | `""` | WeChat merchant ID | `server.ts:205` |
| `WX_SERIAL_NO` | Yes | `""` | Certificate serial number | `server.ts:206` |
| `WX_PRIVATE_KEY_PATH` | Yes | `""` | Path to private key file | `server.ts:207` |
| `WX_APIV3_KEY` | Yes | `""` | API v3 key for signature | `server.ts:208` |
| `WX_APP_ID` | Yes | `""` | WeChat App ID | `server.ts:209` |
| `PAYMENT_SERVER_BASE_URL` | No | `https://api.thothapp.com` | Base URL for callbacks | `server.ts:275` |

### 1.4 Alipay (China Market)

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `ALIPAY_APP_ID` | Yes | `""` | Alipay application ID | `server.ts:422` |
| `ALIPAY_PRIVATE_KEY` | Yes | `""` | Application private key | `server.ts:423` |
| `ALIPAY_PUBLIC_KEY` | Yes | `""` | Alipay public key | `server.ts:424` |
| `ALIPAY_GATEWAY` | No | `https://openapi.alipay.com/gateway.do` | Alipay API gateway | `server.ts:425` |
| `ALIPAY_NOTIFY_URL` | No | `{PAYMENT_SERVER_BASE_URL}/api/alipay/callback` | Callback URL | `server.ts:426` |

### 1.5 Google Play Billing (International Market)

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `GOOGLE_PLAY_PACKAGE_NAME` | No | `com.thoth.dreamarchive` | Android package name | `server.ts:672` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Yes | - | Path to GCP service account JSON | `server.ts:682` |
| `GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN` | Recommended | - | Shared secret for RTDN webhook | Plan doc |

### 1.6 Firebase

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `FIREBASE_API_KEY` | Yes | - | Firebase API key | `packages/common/src/firebase.ts:8` |
| `FIREBASE_AUTH_DOMAIN` | Yes | - | Firebase auth domain | `packages/common/src/firebase.ts:9` |

### 1.7 AI Services

| Variable | Required | Current Default | Description | Location |
|----------|----------|-----------------|-------------|----------|
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key | `packages/common/src/ai/*.ts` |

---

## 2. Google Play Console Configuration

### 2.1 Product Definitions

Create the following products in **Play Console > Monetize > Products**:

| Product Type | Product ID | Display Name | Description | Price | Status |
|--------------|------------|--------------|-------------|-------|--------|
| Subscription | `thoth_premium_monthly` | Thoth Premium (Monthly) | Unlimited AI dream analyses, advanced features | $4.99/month | ⬜ Not created |
| Subscription | `thoth_premium_yearly` | Thoth Premium (Yearly) | Unlimited AI dream analyses, advanced features (save 20%) | $39.99/year | ⬜ Not created |
| Consumable | `thoth_credits_10` | 10 Dream Credits | 10 additional AI analyses beyond daily quota | $0.99 | ⬜ Not created |
| Consumable | `thoth_credits_50` | 50 Dream Credits | 50 additional AI analyses beyond daily quota | $3.99 | ⬜ Not created |

### 2.2 Subscription Base Plan Settings

For each subscription product, configure:

- [ ] **Billing period**: Monthly / Yearly
- [ ] **Grace period**: 3 days
- [ ] **Account hold**: 7 days
- [ ] **Resume**: Auto-resume after grace period
- [ ] **Proration mode**: `PRORATE_BY_TIME`

### 2.3 Google Play Developer API

- [ ] **Link GCP project**: Play Console > Setup > API access
- [ ] **Create service account**: With "Financial Data" permission
- [ ] **Download JSON key**: Store securely on server (not in source control)
- [ ] **Enable API**: Google Play Android Developer API

### 2.4 Real-Time Developer Notifications (RTDN)

- [ ] **Enable Cloud Pub/Sub API** in GCP project
- [ ] **Create Pub/Sub topic**: `projects/{project_id}/topics/thoth-billing-notifications`
- [ ] **Create push subscription**: Pointing to `https://api.thothapp.com/api/google-play/rtdn`
- [ ] **Grant publisher role**: `google-play-developer-notifications@system.gserviceaccount.com`
- [ ] **Enable RTDN in Play Console**: Monetize > Monetization setup
- [ ] **Select notification types**: "Get all notifications for subscriptions and one-time products"

---

## 3. Firestore Integration TODOs

The following Firestore operations are marked as TODO in `server.ts` and need implementation:

| Location | Function | Description | Status |
|----------|----------|-------------|--------|
| `server.ts:801` | `/api/google-play/verify` | Update user profile with subscription tier after verification | ⬜ Not implemented |
| `server.ts:895` | `/api/google-play/consume` | Update user `credits_balance` after consuming purchase | ⬜ Not implemented |
| `server.ts:923` | `/api/google-play/subscription-status` | Read user subscription status from Firestore | ⬜ Not implemented |
| `server.ts:973` | `/api/google-play/rtdn` | Update Firestore based on RTDN notification type | ⬜ Not implemented |

### Firestore Schema Changes Required

Add the following fields to `users/{userId}` collection:

```typescript
interface FirestoreUserDocument {
  // ... existing fields ...
  subscription_tier: 'free' | 'premium';           // NEW
  subscription_plan_id: string | null;              // NEW
  subscription_expiry: Timestamp | null;            // NEW
  subscription_auto_renewing: boolean;              // NEW
  subscription_purchase_token: string | null;       // NEW
  credits_balance: number;                          // NEW
}
```

Create new `purchases` collection for audit trail:

```typescript
interface FirestorePurchaseDocument {
  user_id: string;
  provider: 'google_play' | 'wechat' | 'alipay';
  purchase_token: string;
  product_id: string;
  order_id: string;
  purchase_time: Timestamp;
  verification_time: Timestamp;
  verified: boolean;
  amount_micros: number;
  currency: string;
}
```

---

## 4. Security TODOs

| Item | Location | Priority | Status |
|------|----------|----------|--------|
| WeChat Pay callback signature verification | `server.ts:343` | High | ⬜ Not implemented |
| RTDN webhook authentication | `server.ts:947` | Medium | ⬜ Not implemented |
| Firestore security rules for subscription data | Firestore rules | High | ⬜ Not implemented |

### WeChat Signature Verification

Implement HMAC-SHA256 verification of `Wechatpay-Signature` header before processing payment callbacks.

---

## 5. WearOS TODOs

| Item | Location | Description | Status |
|------|----------|-------------|--------|
| DreamListScreen implementation | `wear/.../DreamListScreen.kt` | Replace TODO placeholder with actual LazyColumn | ⬜ Not implemented |
| DreamListViewModel.loadDreams() | `wear/.../DreamListViewModel.kt` | Connect to Firestore | ⬜ Not implemented |
| DreamListUiState.dreams type | `wear/.../DreamListViewModel.kt` | Change `List<Any>` to `List<Dream>` | ⬜ Not implemented |

---

## 6. Pre-Production Checklist

### Before First Deployment

- [ ] All required environment variables are set
- [ ] Google Play products are created and active
- [ ] Service account JSON is stored securely
- [ ] RTDN is configured and tested (send test message from Play Console)
- [ ] Firestore integration is complete
- [ ] WeChat signature verification is implemented
- [ ] Run `npm install` to install new dependencies (`google-auth-library`)

### Testing

- [ ] Test subscription purchase flow with internal test track
- [ ] Test consumable credits purchase
- [ ] Test purchase restoration
- [ ] Test RTDN webhook with simulated notifications
- [ ] Verify subscription state updates correctly in Firestore

---

## 7. Quick Reference: File Locations

| Category | File | Purpose |
|----------|------|---------|
| **Plan** | `docs/planning/android/GOOGLE_PLAY_BILLING_PLAN.md` | Full integration plan |
| **Checklist** | `docs/planning/android/CONFIGURATION_CHECKLIST.md` | This file |
| **Android Plugin** | `android/.../billing/ThothBillingPlugin.java` | Capacitor plugin entry |
| **Billing Manager** | `android/.../billing/BillingManager.java` | BillingClient lifecycle |
| **Purchase Handler** | `android/.../billing/PurchaseHandler.java` | Result processing |
| **Frontend Bridge** | `src/lib/google-play-billing.ts` | TypeScript plugin interface |
| **Subscription API** | `src/lib/subscription.ts` | Purchase orchestration |
| **Payment Routing** | `src/lib/payments/index.ts` | Provider detection |
| **Backend** | `server.ts` | Verification endpoints |

---

*Last updated: 2026-05-23*
