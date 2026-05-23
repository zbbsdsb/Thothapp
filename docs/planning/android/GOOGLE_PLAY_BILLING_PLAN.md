# Google Play Billing Integration — Execution Plan for Thothapp

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | `GOOGLE_PLAY_BILLING_PLAN.md` |
| Target Location | `docs/planning/android/GOOGLE_PLAY_BILLING_PLAN.md` |
| Version | 1.0.0 |
| Date | 2026-05-22 |
| Status | Draft — Awaiting Architecture Confirmation |

---

## 1. Executive Summary

This plan details the integration of Google Play Billing into the Thothapp Android project. The project is a Capacitor-based cross-platform app where the Android module (`:app`) is a minimal WebView shell with only 2 Java files (`MainActivity.java` and `WXEntryActivity.java`). All business logic, UI, and state management live in the React + TypeScript frontend.

The recommended approach is a **custom Capacitor plugin** (`ThothBillingPlugin`) written in Java, registered in `MainActivity.java`, that wraps the Google Play Billing Library 9.0.0 and exposes a clean async bridge to the TypeScript frontend. This follows the same architectural pattern used by `WXEntryActivity` for WeChat Pay — native Android code handles the platform SDK, and results flow back to the web layer.

---

## 2. Architecture Decision: Custom Capacitor Plugin

### 2.1 Approach Comparison

| Criterion | Custom Capacitor Plugin | Community Plugin (`@capacitor-community/in-app-purchases`) |
|-----------|------------------------|-------------------------------------------------------------|
| **Control** | Full control over Billing Library API, error handling, and purchase flow | Limited to what the plugin exposes; may lag behind Billing Library updates |
| **Security** | purchaseToken never exposed to frontend; server-side verification enforced | Depends on plugin implementation; may leak tokens to JS layer |
| **Maintenance** | Maintained by Thoth team; aligned with project needs | Community-maintained; may abandon or break on major Billing Library updates |
| **Consistency** | Matches existing WXEntryActivity pattern (native callback → web bridge) | Different pattern; introduces architectural inconsistency |
| **Billing Library Version** | Can target 9.0.0 immediately | May be pinned to older version; Billing 8 mandatory deadline is Aug 31, 2026 |
| **Complexity** | Higher initial setup; lower long-term risk | Lower initial setup; higher long-term risk |

**Decision: Custom Capacitor Plugin.** The project already follows a "thin native shell + fat web layer" pattern. A custom plugin keeps this consistent, gives full control over security-critical purchase token handling, and ensures compliance with Billing Library 9.0.0 requirements.

### 2.2 High-Level Data Flow

```
Frontend (React/TS)                Android (Java)                    Backend (Express)
=====================             ===============                   ==================
                                     +-----------+
                                     | Billing   |
                                     | Client    |
src/lib/google-play-billing.ts  --> | (9.0.0)   |
  .purchase(productId)               +-----------+
       |                                     |
       |  Capacitor Bridge                   |  Google Play
       |  (async/await)                      |  Billing Flow
       v                                     v
  Plugin call  ----------------->  ThothBillingPlugin.java
       ^                                |
       |                                |  PurchasesUpdatedListener
       |                                |  (purchaseToken, orderId)
       |                                v
       |                         JSObject result
       |                         { purchaseToken, orderId,
       |                           productId, purchaseState }
       |
       v
  Frontend sends purchaseToken
  to backend for verification
       |
       v
POST /api/google-play/verify   -->  server.ts
                                        |
                                        |  Google Play Developer API
                                        |  (purchases.subscriptionsv2.get)
                                        v
                                   Verify + acknowledge
                                        |
                                        v
                                   Update Firestore user profile
                                   (subscription tier, expiry)
                                        |
                                        v
                                   Return { verified: true, tier: "premium" }
```

---

## 3. Phase Breakdown

### Phase 0: Google Play Console Setup (Prerequisites)

**Goal:** Configure products and API access before writing any code.

#### 3.0.1 Play Console Account Setup

- Ensure Google Play Developer account is active and linked to Google Payments Center.
- Verify the app `oasis.thoth` (package: `com.thoth.dreamarchive`) is published on at least the internal test track.

#### 3.0.2 Product Configuration

Define the following products in Play Console > Monetize > Products:

| Product Type | Product ID | Display Name | Description |
|-------------|-----------|--------------|-------------|
| Subscription (base plan) | `thoth_premium_monthly` | Thoth Premium (Monthly) | Unlimited AI dream analyses, advanced features |
| Subscription (base plan) | `thoth_premium_yearly` | Thoth Premium (Yearly) | Unlimited AI dream analyses, advanced features (save 20%) |
| One-time (consumable) | `thoth_credits_10` | 10 Dream Credits | 10 additional AI analyses beyond daily quota |
| One-time (consumable) | `thoth_credits_50` | 50 Dream Credits | 50 additional AI analyses beyond daily quota |

**Subscription base plan settings:**
- Billing period: Monthly / Yearly
- Price: TBD (recommend $4.99/month, $39.99/year for initial launch)
- Grace period: 3 days
- Account hold: 7 days
- Resume: Auto-resume after grace period
- Proration mode: `PRORATE_BY_TIME`

#### 3.0.3 Google Play Developer API Configuration

1. Go to Play Console > Setup > API access.
2. Link a Google Cloud project (can reuse the existing Firebase GCP project).
3. Create an OAuth 2.0 service account.
4. Grant the service account the **Financial Data** permission in the Play Console.
5. Download the service account JSON key file.
6. Store the key file securely on the backend server (not in source control).

#### 3.0.4 Real-Time Developer Notifications (RTDN)

1. In the linked GCP project, enable the Cloud Pub/Sub API.
2. Create a Pub/Sub topic: `projects/{project_id}/topics/thoth-billing-notifications`.
3. Create a push subscription pointing to: `https://api.thothapp.com/api/google-play/rtdn`.
4. Grant `google-play-developer-notifications@system.gserviceaccount.com` the **Pub/Sub Publisher** role on the topic.
5. In Play Console > Monetize > Monetization setup, enable RTDN with the topic name.
6. Select "Get all notifications for subscriptions and one-time products".

**Environment variables for backend:**

| Variable | Description |
|----------|-------------|
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Path to service account JSON key file |
| `GOOGLE_PLAY_PACKAGE_NAME` | `com.thoth.dreamarchive` |
| `GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN` | Shared secret for RTDN webhook verification |

---

### Phase 1: Native Android Plugin (Java)

**Goal:** Create the `ThothBillingPlugin` Capacitor plugin that wraps Billing Library 9.0.0.

#### 3.1.1 Dependency Addition

**File:** `android/variables.gradle`

Add a new version variable:

```groovy
ext {
    // ... existing versions ...
    billingClientVersion = '9.0.0'
}
```

**File:** `android/app/build.gradle`

Add the Billing Library dependency in the `dependencies` block:

```groovy
dependencies {
    // ... existing dependencies ...
    implementation "com.android.billingclient:billing:$billingClientVersion"
}
```

#### 3.1.2 New Files to Create

All new Java files go under the existing package path:

```
android/app/src/main/java/com/thoth/dreamarchive/
    billing/
        ThothBillingPlugin.java        # Main Capacitor plugin class
        BillingManager.java            # BillingClient lifecycle management
        PurchaseHandler.java           # Purchase result processing
```

**File: `ThothBillingPlugin.java`**

This is the Capacitor plugin entry point, annotated with `@CapacitorPlugin`. It exposes the following methods to the frontend:

| Method | Direction | Description |
|--------|-----------|-------------|
| `initialize()` | Frontend → Native | Initialize BillingClient, start connection |
| `queryProducts(productIds[])` | Frontend → Native | Query product details (subs + in-app) |
| `purchase(productId, offerToken)` | Frontend → Native | Launch billing flow for a product |
| `consumePurchase(purchaseToken)` | Frontend → Native | Consume a one-time purchase |
| `getPurchases()` | Frontend → Native | Query active purchases (for restore) |
| `acknowledgePurchase(purchaseToken)` | Frontend → Native | Acknowledge a purchase (server-side preferred, fallback) |

Key implementation details:
- Extends `com.getcapacitor.Plugin`
- Uses `@CapacitorPlugin(name = "ThothBilling")` annotation
- Delegates to `BillingManager` for all BillingClient operations
- Returns `JSObject` results with structured purchase data
- Returns `purchaseToken` to frontend (the token is not a secret — it is designed to be sent to your own server). The real security is in server-side verification via the Google Play Developer API.

**File: `BillingManager.java`**

Manages the `BillingClient` lifecycle:
- Creates `BillingClient` with `enablePendingPurchases()` and `enableAutoServiceReconnection()`
- Implements `BillingClientStateListener` for connection state
- Implements `PurchasesUpdatedListener` for purchase results
- Handles reconnection logic
- Stores pending purchase callbacks via `PluginCall`

**File: `PurchaseHandler.java`**

Processes purchase results:
- Parses `Purchase` objects into `JSObject` for the Capacitor bridge
- Maps `BillingResponseCode` to human-readable error messages
- Handles edge cases: pending purchases, already owned items, user cancelled

#### 3.1.3 Plugin Registration

**File:** `android/app/src/main/java/com/thoth/dreamarchive/MainActivity.java`

Update from:

```java
package com.thoth.dreamarchive;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {}
```

To:

```java
package com.thoth.dreamarchive;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.thoth.dreamarchive.billing.ThothBillingPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ThothBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

#### 3.1.4 ProGuard Rules

**File:** `android/app/proguard-rules.pro`

Add:

```proguard
# ==================== Google Play Billing ====================
-keep class com.android.vending.billing.** { *; }
-keep class com.android.billingclient.** { *; }
```

#### 3.1.5 AndroidManifest.xml

No manifest changes are required for Google Play Billing. The Billing Library communicates via Google Play Services, which is already present.

---

### Phase 2: TypeScript Frontend Integration

**Goal:** Create the frontend service layer that communicates with the native plugin and backend.

#### 3.2.1 New Files to Create

```
src/lib/
    google-play-billing.ts          # Capacitor plugin bridge + purchase orchestration
src/types/
    (update index.ts)               # Add Google Play Billing types
```

**File: `src/lib/google-play-billing.ts`**

```typescript
import { registerPlugin } from '@capacitor/core';

export interface ThothBillingPlugin {
  initialize(): Promise<{ connected: boolean }>;
  queryProducts(options: { productIds: string[]; type: 'subs' | 'inapp' }): Promise<QueryProductsResult>;
  purchase(options: { productId: string; offerToken: string }): Promise<PurchaseResult>;
  consumePurchase(options: { purchaseToken: string }): Promise<{ success: boolean }>;
  getPurchases(): Promise<GetPurchasesResult>;
}

export interface QueryProductsResult {
  products: ProductDetail[];
}

export interface ProductDetail {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
  subscriptionOfferDetails?: SubscriptionOfferDetail[];
  oneTimePurchaseOfferDetails?: {
    price: string;
    priceAmountMicros: number;
    currencyCode: string;
  };
}

export interface SubscriptionOfferDetail {
  offerId: string;
  offerToken: string;
  pricingPhases: PricingPhase[];
}

export interface PricingPhase {
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
  billingPeriod: string;
  recurrenceMode: number;
}

export interface PurchaseResult {
  success: boolean;
  purchaseToken: string;
  productId: string;
  orderId: string;
  purchaseState: number;
  acknowledgementState: number;
  autoRenewing: boolean;
}

export interface GetPurchasesResult {
  purchases: PurchaseResult[];
}

const ThothBilling = registerPlugin<ThothBillingPlugin>('ThothBilling');

export default ThothBilling;
```

**Orchestration function** (in `src/lib/subscription.ts`):

```typescript
export async function purchaseSubscription(
  productId: string,
  userId: string,
): Promise<{ verified: boolean; tier: string }> {
  // 1. Query product details to get offerToken
  const { products } = await ThothBilling.queryProducts({
    productIds: [productId],
    type: 'subs',
  });
  if (!products.length) throw new Error('Product not found');

  const offerToken = products[0].subscriptionOfferDetails?.[0]?.offerToken;
  if (!offerToken) throw new Error('No offer available');

  // 2. Launch billing flow
  const purchase = await ThothBilling.purchase({ productId, offerToken });
  if (!purchase.success) throw new Error('Purchase failed');

  // 3. Send to backend for verification
  const serverUrl = import.meta.env.VITE_PAYMENT_SERVER_URL;
  const res = await fetch(`${serverUrl}/api/google-play/verify`, {
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
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}
```

#### 3.2.2 Type Updates

**File:** `src/types/index.ts`

Add new types alongside the existing payment types:

```typescript
// ── Google Play Billing ────────────────────────────────────
export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  planId: string;
  expiryDate: string | null;
  autoRenewing: boolean;
  gracePeriodEndsAt: string | null;
  accountHold: boolean;
  paused: boolean;
}

export interface GooglePlayPurchaseRecord {
  userId: string;
  purchaseToken: string;
  productId: string;
  orderId: string;
  purchaseTime: number;
  verified: boolean;
  acknowledged: boolean;
}
```

#### 3.2.3 Quota System Upgrade

The current quota system uses a simple daily count (`daily_usage_count` vs `daily_quota_limit`). This needs to be upgraded to support subscription tiers.

**Changes to `UserProfile` interface in `src/types/index.ts`:**

```typescript
export interface UserProfile {
  // ... existing fields ...
  subscription_tier: 'free' | 'premium';     // NEW
  subscription_plan_id: string | null;        // NEW
  subscription_expiry: string | null;          // NEW: ISO 8601 date
  subscription_auto_renewing: boolean;         // NEW
  credits_balance: number;                     // NEW: consumable credits
}
```

**Quota logic change:**
- Free tier: 3 dreams/day (unchanged)
- Premium tier: unlimited dreams/day (no quota check)
- Credits: deducted from `credits_balance` when used, regardless of tier

---

### Phase 3: Backend Server-Side Verification

**Goal:** Add server endpoints for purchase verification, RTDN webhook, and subscription state management.

#### 3.3.1 New Dependencies

**File:** `package.json`

Add:

```json
{
  "dependencies": {
    "google-auth-library": "^9.0.0"
  }
}
```

The `google-auth-library` package handles OAuth2 JWT authentication for the Google Play Developer API service account.

#### 3.3.2 New Server Endpoints

All endpoints are added to `server.ts`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/google-play/verify` | POST | Verify a purchase token via Play Developer API |
| `/api/google-play/rtdn` | POST | RTDN webhook from Cloud Pub/Sub push |
| `/api/google-play/subscription-status` | GET | Query user's current subscription status |
| `/api/google-play/consume` | POST | Consume a one-time purchase (server-side) |

**Endpoint 1: `POST /api/google-play/verify`**

Request body:
```json
{
  "purchaseToken": "xxx",
  "productId": "thoth_premium_monthly",
  "orderId": "GPA.xxxx",
  "userId": "firebase-uid"
}
```

Logic:
1. Authenticate with Google Play Developer API using service account credentials.
2. Call `purchases.subscriptionsv2.get` (for subscriptions) or `purchases.products.get` (for one-time).
3. Verify: `purchaseState == 0` (purchased), `packageName == "com.thoth.dreamarchive"`, `orderId` matches.
4. If subscription: check `subscriptionState` (active, cancelled, in_grace_period, on_hold, paused, expired).
5. Call `purchases.subscriptionsv2.acknowledge` if not already acknowledged.
6. Update Firestore user profile with subscription tier and expiry.
7. Return verification result.

**Endpoint 2: `POST /api/google-play/rtdn`**

Logic:
1. Verify the push subscription authenticity (check Pub/Sub push verification).
2. Parse the Pub/Sub message (base64-encoded data).
3. Extract `notificationType` and `purchaseToken` from the RTDN payload.
4. Call Play Developer API to get full purchase details.
5. Update Firestore based on notification type:
   - `SUBSCRIPTION_PURCHASED` → grant premium
   - `SUBSCRIPTION_RENEWED` → extend expiry
   - `SUBSCRIPTION_IN_GRACE_PERIOD` → keep premium, flag grace period
   - `SUBSCRIPTION_ON_HOLD` → revoke premium access
   - `SUBSCRIPTION_REVOKED` → revoke premium access
   - `SUBSCRIPTION_EXPIRED` → revoke premium access
   - `ONE_TIME_PRODUCT_PURCHASED` → add credits
   - `ONE_TIME_PRODUCT_CANCELED` → no action (refund handled by Play)
6. Return HTTP 200 to acknowledge receipt.

**Endpoint 3: `GET /api/google-play/subscription-status`**

Query parameter: `userId`

Logic:
1. Read user profile from Firestore.
2. If subscription is active and not expired, return current tier.
3. If expired, call Play Developer API to re-verify (in case RTDN was missed).
4. Return subscription status.

**Endpoint 4: `POST /api/google-play/consume`**

Request body:
```json
{
  "purchaseToken": "xxx",
  "productId": "thoth_credits_10",
  "userId": "firebase-uid"
}
```

Logic:
1. Call `purchases.products.consume` on Play Developer API.
2. Add credits to user's `credits_balance` in Firestore.
3. Return updated balance.

#### 3.3.3 Firestore Schema Changes

**Collection: `users/{userId}`** — Add fields to existing user document:

```typescript
interface FirestoreUserDocument {
  // ... existing fields ...
  subscription_tier: 'free' | 'premium';
  subscription_plan_id: string | null;
  subscription_expiry: Timestamp | null;
  subscription_auto_renewing: boolean;
  subscription_purchase_token: string | null;
  credits_balance: number;
}
```

**New collection: `purchases`** (for audit trail):

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

#### 3.3.4 Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Path to service account JSON key | GCP Console |
| `GOOGLE_PLAY_PACKAGE_NAME` | `com.thoth.dreamarchive` | Static |
| `GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN` | Shared secret for webhook auth | Self-generated |

---

### Phase 4: Integration Testing

**Goal:** Validate the complete purchase flow end-to-end.

#### 3.4.1 Test Accounts

- Use Google Play Console internal test track with licensed test accounts.
- Licensed test accounts can make purchases without real money (up to spend limits).
- Test all subscription states: purchase, renew, cancel, grace period, expiry.

#### 3.4.2 Test Scenarios

| # | Scenario | Expected Result |
|---|----------|----------------|
| 1 | Initialize billing on app launch | BillingClient connects successfully |
| 2 | Query product details | Returns localized price, title, description |
| 3 | Purchase monthly subscription | Billing flow opens, purchase completes, token verified |
| 4 | Verify purchase on backend | Firestore updated with premium tier |
| 5 | Restore purchases (getPurchases) | Previously purchased subscriptions returned |
| 6 | Cancel subscription (Play Console) | RTDN fires, subscription state updated |
| 7 | Grace period simulation | User retains premium during grace period |
| 8 | Account hold simulation | User loses premium after hold period |
| 9 | Purchase consumable credits | Credits added to balance |
| 10 | Consume credits | Balance decremented correctly |
| 11 | Network error during purchase | Graceful error message, no partial state |
| 12 | App killed during purchase | Pending purchase recovered on next launch |
| 13 | Multiple devices | Subscription shared across devices (same Google account) |
| 14 | Refund processing | RTDN notifies refund, premium revoked |

#### 3.4.3 Unit Tests

**Android (JUnit):**
- `BillingManagerTest.java` — connection lifecycle, reconnection
- `PurchaseHandlerTest.java` — purchase result parsing, error mapping
- `ThothBillingPluginTest.java` — plugin method dispatch

**Backend (Jest):**
- `google-play-verify.test.ts` — verification logic with mocked Play API
- `google-play-rtdn.test.ts` — RTDN webhook processing
- `subscription-status.test.ts` — subscription state queries

**Frontend (Jest + React Testing Library):**
- `google-play-billing.test.ts` — plugin bridge calls
- `subscription.test.ts` — purchase orchestration flow

---

### Phase 5: Coexistence with Existing Payments

**Goal:** Ensure Google Play Billing works alongside WeChat Pay and Alipay without conflicts.

#### 3.5.1 Payment Provider Routing

The existing payment architecture uses WeChat Pay and Alipay for the China market. Google Play Billing is for the international market.

**Routing logic** (to be implemented in `src/lib/payments/index.ts`):

```typescript
type PaymentProvider = 'google_play' | 'wechat' | 'alipay';

function detectPaymentProvider(): PaymentProvider {
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
```

#### 3.5.2 Backend Unification

The existing `server.ts` has WeChat Pay routes (`/api/payment/*`) and Alipay routes (`/api/alipay/*`). Google Play routes will be added as `/api/google-play/*`. All three providers write to the same `purchases` Firestore collection with a `provider` discriminator field.

#### 3.5.3 Feature Gating Unification

The quota check currently in the frontend (3 dreams/day) needs to be updated to check the user's `subscription_tier` from Firestore:

```typescript
async function checkQuota(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await getUserProfile(userId);

  if (profile.subscription_tier === 'premium' && !isSubscriptionExpired(profile)) {
    return { allowed: true };
  }

  const today = new Date().toISOString().split('T')[0];
  if (profile.last_usage_date === today && profile.daily_usage_count >= profile.daily_quota_limit) {
    if (profile.credits_balance > 0) {
      return { allowed: true, reason: 'credit' };
    }
    return { allowed: false, reason: 'daily_quota_exceeded' };
  }

  return { allowed: true };
}
```

---

## 4. Complete File Change Summary

### New Files

| File | Description |
|------|-------------|
| `android/app/src/main/java/com/thoth/dreamarchive/billing/ThothBillingPlugin.java` | Capacitor plugin entry point |
| `android/app/src/main/java/com/thoth/dreamarchive/billing/BillingManager.java` | BillingClient lifecycle management |
| `android/app/src/main/java/com/thoth/dreamarchive/billing/PurchaseHandler.java` | Purchase result processing |
| `src/lib/google-play-billing.ts` | Frontend plugin bridge and types |
| `src/lib/subscription.ts` | Subscription purchase orchestration |
| `src/lib/payments/index.ts` | Unified payment provider routing |

### Modified Files

| File | Change |
|------|--------|
| `android/variables.gradle` | Add `billingClientVersion = '9.0.0'` |
| `android/app/build.gradle` | Add Billing Library dependency |
| `android/app/src/main/java/com/thoth/dreamarchive/MainActivity.java` | Register `ThothBillingPlugin` |
| `android/app/proguard-rules.pro` | Add Billing Library keep rules |
| `src/types/index.ts` | Add subscription and billing types |
| `server.ts` | Add Google Play verification, RTDN, subscription-status, consume endpoints |
| `package.json` | Add `google-auth-library` dependency |

### No Changes Required

| File | Reason |
|------|--------|
| `capacitor.config.ts` | No new Capacitor config needed (plugin is registered in Java) |
| `AndroidManifest.xml` | Billing Library does not require manifest entries |
| `WXEntryActivity.java` | WeChat Pay remains unchanged |
| `src/lib/payment.ts` | Existing WeChat/Alipay code remains unchanged |

---

## 5. Dependency Graph and Sequencing

```
Phase 0 (Play Console)
    |
    v
Phase 1 (Native Plugin) ──┐
    |                      |
    v                      v
Phase 2 (Frontend TS)   Phase 3 (Backend)
    |                      |
    └──────┬───────────────┘
           v
    Phase 4 (Integration Testing)
           |
           v
    Phase 5 (Payment Coexistence)
```

**Critical path:** Phase 0 → Phase 1 → Phase 3 (backend must verify before frontend can complete purchase flow).

**Parallel work:** Phase 2 (frontend) and Phase 3 (backend) can be developed in parallel once Phase 1 (native plugin API) is defined.

---

## 6. Security Checklist

| Item | Status | Notes |
|------|--------|-------|
| Purchase token verified server-side | Required | Never trust client-side purchase state |
| Play Developer API uses service account | Required | No API keys in client code |
| RTDN webhook authenticated | Required | Verify Pub/Sub push authenticity |
| Subscription state checked on every app launch | Required | RTDN can be delayed or missed |
| Voided purchases checked | Required | Refunded purchases must be detected |
| ProGuard rules for Billing Library | Required | Prevent obfuscation breaking serialization |
| Service account JSON not in source control | Required | Store as file on server, reference via env var |
| Firestore security rules updated | Required | Only allow users to read their own subscription data |
| Billing Library 9.0.0 (or latest) | Required | Billing 8 mandatory by Aug 31, 2026 |
| `enablePendingPurchases()` called | Required | Required by Google Play policy |
| `enableAutoServiceReconnection()` called | Recommended | Reduces `SERVICE_DISCONNECTED` errors |

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Billing Library version conflict with Capacitor | Build failure | Test with `capacitor-cordova-android-plugins`; Billing Library 9.0.0 is compatible with compileSdk 36 |
| Google Play Services not available on device (e.g., Huawei) | Billing unavailable | Detect availability in `BillingManager`; fall back to web payment or show "not supported" message |
| RTDN delivery delay | Subscription state stale | Always re-verify subscription on app launch via Play Developer API |
| Service account permissions misconfigured | Verification fails | Test with internal test track before production |
| In-memory order store in server.ts | Data loss on restart | Replace with Firestore `purchases` collection (already planned in Phase 3) |
| Existing `daily_usage_count` quota system incompatible with subscriptions | Feature gating broken | Upgrade `UserProfile` schema with migration script for existing users |

---

## 8. Future Considerations (Out of Scope)

- **iOS App Store IAP:** Requires separate integration with StoreKit 2 via a Capacitor plugin for iOS. The `src/lib/payments/index.ts` routing logic should be designed to accommodate this.
- **Stripe integration for web:** International web users cannot use Google Play Billing. Consider Stripe as a web payment option.
- **Promotional offers / introductory pricing:** Play Console supports introductory pricing phases. The `PricingPhase` type in the frontend already accounts for this.
- **Family Library sharing:** Google Play supports family sharing for subscriptions. No additional code needed; Play handles this automatically.
- **Analytics:** Track conversion funnel (product view → purchase initiation → completion) via Firebase Analytics events.

---

## 9. References

- [Google Play Billing — Getting Ready](https://developer.android.com/google/play/billing/getting-ready) (updated 2026-05-19)
- [Google Play Billing — Integrate](https://developer.android.com/google/play/billing/integrate)
- [Google Play Billing — Subscriptions](https://developer.android.com/google/play/billing/subscriptions)
- [Google Play Billing — Security](https://developer.android.com/google/play/billing/security)
- [Google Play Developer API — Purchases.subscriptionsv2](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2)
- [Billing Library 8 Migration Deadline](https://developer.android.com/google/play/billing/migrate-gpblv7) — August 31, 2026
- Existing payment architecture: `docs/PAYMENT_INTEGRATION.md`
- Existing quota system: `docs/QUOTA.md`
- Existing project structure: `docs/PROJECT_STRUCTURE.md`
