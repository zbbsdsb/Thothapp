---
title: "Alipay Integration"
description: "Guide for integrating Alipay App Payment into Thoth"
category: "specs"
---
# Alipay (App Payment) Integration Guide

## Overview

Thoth supports **Alipay App Payment** for mainland China users. Payment is processed via Alipay OpenAPI with RSA2 (SHA256WithRSA) signatures. The backend generates and signs order parameters; the client opens the Alipay SDK to complete payment.

This integration follows the existing WeChat Pay architecture pattern for consistency.

> **Status**: This document covers code preparation only. Actual Alipay activation requires a registered Alipay merchant account and API credentials (see [Prerequisites](#prerequisites)).

---

## Architecture

```
Client (src/lib/payment.ts)
    │
    │ POST /api/alipay/create-order
    ▼
Backend (server.ts)
    │
    │ Call alipay.trade.app.pay
    ▼
Alipay OpenAPI
    │
    │ ← { orderStr (signed) }
    ▼
Client: openAlipay()  ──→  Alipay App (user pays)
    │
    │ async callback (native layer)
    │
    ▼
Alipay → Backend POST /api/alipay/callback (async notification)
```

---

## Files Modified/Added

| File | Change |
|------|--------|
| `src/types/index.ts` | Extend with Alipay payment types |
| `src/lib/payment.ts` | Extend payment service with Alipay functions |
| `server.ts` | Add Alipay payment API routes |
| `android/app/build.gradle` | Add Alipay SDK dependency |
| `android/app/src/main/AndroidManifest.xml` | Add Alipay related configuration |
| `ios/App/Info.plist` | Add Alipay URL scheme |
| `ios/App/AppDelegate.swift` | Add Alipay callback handling |

---

## Environment Variables

### Backend (`server.ts`)

| Variable | Description | Source |
|----------|-------------|--------|
| `ALIPAY_APP_ID` | Alipay Open Platform App ID | Alipay Open Platform |
| `ALIPAY_PRIVATE_KEY` | Alipay merchant private key (PKCS8 format) | Generated via Alipay Open Platform |
| `ALIPAY_PUBLIC_KEY` | Alipay public key | Alipay Open Platform |
| `ALIPAY_GATEWAY` | Alipay gateway URL | Sandbox: `https://openapi-sandbox.dl.alipaydev.com/gateway.do`, Production: `https://openapi.alipay.com/gateway.do` |
| `ALIPAY_NOTIFY_URL` | Public callback URL for Alipay async notification | Self |

### Frontend (`.env` / GitHub Secrets)

| Variable | Description |
|----------|-------------|
| `VITE_ALIPAY_APP_ID` | Must match `ALIPAY_APP_ID` |
| `VITE_PAYMENT_SERVER_URL` | Backend URL (e.g., `https://api.thothapp.com`) |

---

## Prerequisites (Required Before Going Live)

### 1. Alipay Merchant Account Registration

1. Apply at [https://open.alipay.com/](https://open.alipay.com/)
2. Complete identity verification (individual / business)
3. Sign up for **App Payment** product

### 2. App Creation & Configuration

1. Create a mobile app in Alipay Open Platform
2. Submit app for review
3. Get `app_id`

### 3. Key Generation & Configuration

1. Generate RSA key pair (recommended 2048-bit)
2. Upload public key to Alipay Open Platform
3. Get Alipay public key
4. Configure keys in environment variables

> **Security Note**: Private key must be in PKCS8 format. Never expose private key in client-side code or public repositories.

---

## Usage Example

### Create and initiate an Alipay payment

```typescript
import { payAlipay } from '@/lib/payment';

const result = await payAlipay({
  amount: 99.00,        // ¥99.00 in yuan (not cents!)
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

## Core API Reference

### Backend API Routes

#### `POST /api/alipay/create-order`
Creates an Alipay payment order and returns signed `orderStr`.

**Request Body**:
```json
{
  "out_trade_no": "unique_order_id",
  "total_amount": 99.00,
  "subject": "Order Title",
  "attach": "optional_metadata"
}
```

**Response**:
```json
{
  "orderStr": "signed_order_string_for_alipay_sdk",
  "outTradeNo": "unique_order_id"
}
```

#### `POST /api/alipay/callback`
Handles Alipay async payment notification.

**Response**: `success` or `fail`

#### `GET /api/alipay/query-order`
Queries Alipay order status.

**Query Parameters**: `out_trade_no`

**Response**:
```json
{
  "outTradeNo": "unique_order_id",
  "tradeState": "success|pending|failed|cancelled",
  "transactionId": "alipay_transaction_id",
  "tradeStateDesc": "description"
}
```

---

## Security Notes

| Topic | Recommendation |
|-------|----------------|
| **Private Key Storage** | Store `ALIPAY_PRIVATE_KEY` securely on server, never in GitHub or client-side code |
| **Signing Location** | All signing must be done server-side |
| **Notification Verification** | Always verify Alipay notification signatures before processing |
| **Payment Result Source** | Only trust async notification or query API result; do NOT trust client-side results |
| **Idempotency** | Use `out_trade_no` as idempotency key |
| **Order Store** | The in-memory `Map` in `server.ts` is for demo only. Replace with a database before production |

---

## Alipay Result Status Codes

| resultStatus | Description |
|--------------|-------------|
| 9000 | Payment successful |
| 8000 | Processing (need to query) |
| 6004 | Processing (need to query) |
| 6001 | User cancelled |
| 6002 | Network error |
| 4000 | Payment failed |

---

## Android SDK Integration

### 1. Add Alipay SDK Dependency

Add the Alipay SDK dependency to `android/app/build.gradle`:

```gradle
dependencies {
    // ... existing dependencies ...
    
    // Alipay SDK
    implementation 'com.alipay.sdk:alipaysdk-android:15.8.18'
}
```

### 2. Create Alipay Capacitor Plugin

Create a new Capacitor plugin file for Android at `android/app/src/main/java/com/thoth/dreamarchive/AlipayPlugin.java`:

```java
package com.thoth.dreamarchive;

import android.content.Intent;
import com.alipay.sdk.app.PayTask;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Map;

@CapacitorPlugin(name = "Alipay")
public class AlipayPlugin extends Plugin {

    @PluginMethod
    public void pay(PluginCall call) {
        String orderInfo = call.getString("orderStr");
        if (orderInfo == null) {
            call.reject("Missing orderStr");
            return;
        }

        final PayTask alipay = new PayTask(getActivity());
        Map<String, String> result = alipay.payV2(orderInfo, true);
        
        JSObject ret = new JSObject();
        ret.put("resultStatus", result.get("resultStatus"));
        ret.put("result", result.get("result"));
        ret.put("memo", result.get("memo"));
        call.resolve(ret);
    }
}
```

### 3. Register Plugin in MainActivity

Update `android/app/src/main/java/com/thoth/dreamarchive/MainActivity.java`:

```java
package com.thoth.dreamarchive;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void registerPlugins(ArrayList<Plugin> plugins) {
        super.registerPlugins(plugins);
        plugins.add(new AlipayPlugin());
    }
}
```

### 4. Update AndroidManifest.xml

Add necessary permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

## iOS SDK Integration

### 1. Add Alipay SDK to Podfile

Update `ios/App/Podfile`:

```ruby
target 'App' do
  # ... existing pods ...
  
  # Alipay SDK
  pod 'AlipaySDK-iOS', '~> 15.8.18'
end
```

Then run `pod install` in the `ios/App` directory.

### 2. Create Alipay Capacitor Plugin for iOS

Create a new plugin file at `ios/App/App/AlipayPlugin.swift`:

```swift
import Foundation
import Capacitor
import AlipaySDK

@objc(Alipay)
public class AlipayPlugin: CAPPlugin {
    
    @objc func pay(_ call: CAPPluginCall) {
        guard let orderStr = call.getString("orderStr") else {
            call.reject("Missing orderStr")
            return
        }
        
        DispatchQueue.main.async {
            AlipaySDK.defaultService().payOrder(orderStr, fromScheme: "your-app-scheme") { result in
                let dict = result as? [String: Any] ?? [:]
                call.resolve(dict)
            }
        }
    }
    
    @objc public func handleOpenUrl(_ url: URL) {
        AlipaySDK.defaultService().processOrder(withPaymentResult: url, standbyCallback: nil)
    }
}
```

### 3. Register Plugin

Update `ios/App/App/AppDelegate.swift`:

```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        // Handle Alipay callback
        NotificationCenter.default.post(name: NSNotification.Name("AlipayOpenURL"), object: url)
        return true
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Handle Universal Links if configured
        return true
    }
}
```

### 4. Configure URL Scheme

Add URL scheme to `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>alipay</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>your-app-scheme</string>
        </array>
    </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>alipay</string>
    <string>alipays</string>
</array>
```

---

## Integration Checklist

- [ ] Alipay merchant account created and App Payment product activated
- [ ] RSA key pair generated and configured
- [ ] Environment variables set up
- [ ] Backend API routes implemented
- [ ] Client-side payment functions added
- [ ] Android SDK integrated
- [ ] iOS SDK integrated
- [ ] Sandbox testing completed
- [ ] Production environment configured

---

## Future Improvements

- [ ] Add refund support (`alipay.trade.refund`)
- [ ] Add Alipay花呗分期 support
- [ ] Add payment status to Firestore user profile

---

## Related Documentation

- [Alipay Official App Payment Docs](https://ideservice.alipay.com/cms/site/0izsn4)
- [WeChat Pay Integration](./PAYMENT_INTEGRATION.md)
- [Capacitor Plugin Development Guide](https://capacitorjs.com/docs/plugins/creating-plugins)

---

*Document version: v1.1.0 | Created: 2026-05-13*
