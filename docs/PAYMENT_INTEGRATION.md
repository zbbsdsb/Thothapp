---
title: "Payment Integration"
description: "WeChat Pay integration guide"
category: "specs"
---
# WeChat Pay — App Payment Integration Guide

## Overview

Thoth supports **WeChat Pay (App Payment)** for mainland China users. Payment is processed via **WeChat Pay APIv3** with RSA-SHA256 signatures. The backend generates and signs orders; the client opens the WeChat SDK to complete payment.

> **Status**: This document covers **code preparation only**. Actual WeChat Pay activation requires a registered WeChat merchant account and API credentials (see [Prerequisites](#prerequisites)).

---

## Architecture

```
Client (src/lib/payment.ts)
    │
    │ POST /api/payment/create-order
    ▼
Backend (server.ts)
    │
    │ POST https://api.mch.weixin.qq.com/v3/pay/transactions/app
    ▼
WeChat Pay API
    │
    │ ← { prepay_id, signed SDK params }
    ▼
Client: openWeChatPay()  ──→  WeChat App (user pays)
    │
    │ async callback (WXEntryActivity on Android)
    │
    ▼
WeChat → Backend POST /api/payment/callback (async notification)
WeChat → WXEntryActivity (sync result to app)
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/payment.ts` | New — payment service (create, open, poll) |
| `src/types/index.ts` | New — `PaymentStatus`, `CreateOrderParams`, `PaymentResult` |
| `server.ts` | New routes: `/api/payment/create-order`, `/api/payment/callback`, `/api/payment/query-order` |
| `android/.../WXEntryActivity.java` | New — WeChat SDK callback receiver |
| `android/.../AndroidManifest.xml` | Register WXEntryActivity |

---

## Environment Variables

### Backend (`server.ts`)

| Variable | Description | Source |
|----------|-------------|--------|
| `WX_MCHID` | WeChat merchant ID (e.g. `1234567890`) | WeChat Pay Console |
| `WX_SERIAL_NO` | Merchant certificate serial number | WeChat Pay Console → Certificates |
| `WX_PRIVATE_KEY_PATH` | Absolute path to APIv3 private key `.pem` file | Downloaded from WeChat Pay Console |
| `WX_APIV3_KEY` | APIv3 AES key (32-char) | WeChat Pay Console → APIv3 Key |
| `WX_APP_ID` | WeChat Open Platform App ID | WeChat Open Platform |
| `PAYMENT_SERVER_BASE_URL` | Public base URL of this server (for callback URL) | Self |

### Frontend (`.env` / GitHub Secrets)

| Variable | Description |
|----------|-------------|
| `VITE_WX_APP_ID` | Must match `WX_APP_ID` |
| `VITE_PAYMENT_SERVER_URL` | Backend URL (e.g. `https://api.thothapp.com`) |

---

## Prerequisites (Required Before Going Live)

### 1. WeChat Merchant Registration

1. Apply at [pay.weixin.qq.com](https://pay.weixin.qq.com)
2. Complete identity verification (individual / business)
3. Receive `mchid` (merchant ID)

### 2. Open Platform App Registration

1. Register at [open.weixin.qq.com](https://open.weixin.qq.com)
2. Create a **Mobile App** application
3. Submit for review (7–14 business days)
4. Receive `appid`

### 3. Bind App ID to Merchant

In WeChat Pay Console → **Product Center → App Payment → Configuration**:
- Bind the `appid` to your `mchid`

### 4. Download API Certificates

In WeChat Pay Console → **Account Center → API Certificates**:
- Download the **API certificate** (`.p12` and `.pem`)
- Note the **serial number** of the certificate

### 5. Generate APIv3 Key

In WeChat Pay Console → **Account Center → APIv3 Key**:
- Generate a 32-character AES-256 key
- Store it securely — it cannot be retrieved again

### 6. Configure Callback URL

Set `notify_url` (or configure in console):
- URL: `https://your-domain.com/api/payment/callback`
- Must be publicly accessible via HTTPS

---

## Usage Example

### Create and initiate a payment

```typescript
import { pay } from '@/lib/payment';

const result = await pay({
  amount: 9900,          // ¥99.00 in cents
  title: 'Thoth Premium (1 Year)',
  outTradeNo: crypto.randomUUID(),
  attach: user.uid,
});

if (result.success) {
  // Payment confirmed. Grant premium access here.
  console.log('Transaction ID:', result.result.transactionId);
} else if (result.result.tradeState === 'cancelled') {
  // User cancelled — do nothing.
} else {
  // Failed or timeout — log and retry.
}
```

---

## WeChat SDK Registration

### Android

1. Download the [WeChat Android SDK](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/Android.html)
2. Copy `amap-sdk.jar` and `wechat-sdk-android-with-mta.jar` (or `wechat-sdk-android-without-mta.jar`) to `android/app/libs/`
3. Add to `android/app/build.gradle`:
   ```groovy
   implementation files('libs/wechat-sdk-android-with-mta.jar')
   ```
4. Register in `AndroidManifest.xml` — already done (`WXEntryActivity`)

### iOS

1. Download the [WeChat iOS SDK](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/iOS.html)
2. Add `WechatOpenSDK` to your Xcode project
3. Register URL scheme in `Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>wxaXXXXXXXXXXXXXXX</string>  <!-- your appid -->
       </array>
     </dict>
   </array>
   ```
4. Add to `AppDelegate.swift`:
   ```swift
   func application(_ app: UIApplication, open url: URL,
                    options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
       returnWXApi.handleOpen(url, delegate: self)
   }
   ```

---

## Security Notes

| Topic | Recommendation |
|-------|---------------|
| **Private key** | Store `WX_PRIVATE_KEY_PATH` on the server filesystem, never in GitHub Secrets or code |
| **APIv3 key** | Store in a secrets manager (AWS Secrets Manager / HashiCorp Vault), not in env files |
| **Callback verification** | The signature verification in the callback is marked `TODO`. Implement HMAC-SHA256 verification before processing the payment result |
| **Idempotency** | Use `out_trade_no` as idempotency key; WeChat guarantees no duplicate transactions for the same `out_trade_no` |
| **Order store** | The in-memory `Map` in `server.ts` is for demo only. Replace with a database before production |

---

## Future Improvements

- [ ] Add WeChat signature verification in callback handler
- [ ] Replace in-memory order store with PostgreSQL / Firestore
- [ ] Implement refund API (`POST /v3/refund/domestic/refunds`)
- [ ] Add Apple IAP (In-App Purchase) for iOS App Store compliance
- [ ] Add payment status to Firestore user profile (premium tier)

---

*Document version: v1.0.0 | Created: 2026-04-24*
