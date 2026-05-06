# Thoth — Next Action Plan

> **Last Updated**: 2026-05-05
> **Based on**: MISSING_CHECKLIST.md, planning/NEXT_STEPS.md, planning/ROADMAP.md

---

## 当前项目状态速览

| 模块 | 状态 |
|------|------|
| Web 前端（Vercel + Firebase）| ✅ 已部署，已连接 |
| Android APK 构建 | ⚠️ 需要 `google-services.json` |
| iOS 壳子 | ⚠️ 已 scaffold，等 Mac |
| WearOS | 📋 计划已写，未开始 |
| 微信支付 | ⚠️ 代码已写，等商户凭证 |
| R2 存储 | ⚠️ 代码已写，等凭证 |

**部署分工：**
```
Web 前端  → Vercel（Firebase 已连接 ✅）
Android APK → GitHub Actions（需要 google-services.json + Secrets）
iOS IPA    → GitHub Actions（等 Mac）
```

---

## 执行计划

### 第一阶段：解除 Blocker（今明两天）

**目标：让 Android APK 能正常构建**

**Firebase 配置（已连接 Vercel ✅，只需补 Android 文件）：**

1. Firebase Console → Project Settings → **Android App** → 下载 `google-services.json` → 放入 `android/app/`
2. （等 Mac 后）Firebase Console → Project Settings → **iOS App** → 下载 `GoogleService-Info.plist` → 放入 `ios/App/App/`

---

### 第二阶段：High 优先（本周）

**目标：连通 R2 + 微信支付**

| 事项 | 操作 |
|------|------|
| Cloudflare R2 | Dashboard → R2 → 创建 bucket + API Token |
| 微信支付 | 注册商户平台 + 开放平台 → 拿到 `WX_*` 凭证 |

---

### 第三阶段：安全修复（本周）

| 问题 | 风险 | 操作 |
|------|------|------|
| `thoth-upload-key.jks` 密码 `Thoth@2026` | 🔴 P0 | release 前必须改 |
| WeChat callback 签名未验签 | 🟠 P1 | `server.ts` 第 180 行 TODO |
| 微信支付订单存内存 Map | 🟠 P1 | 上线前迁移到 SQLite |

---

### 第四阶段：CI/CD 打通（Android APK）

**GitHub Secrets 配置（用于 `release.yml` 构建 APK）：**

```github
# Frontend build（嵌入 APK）
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GEMINI_API_KEY
VITE_R2_PUBLIC_URL
VITE_WX_APP_ID
VITE_PAYMENT_SERVER_URL

# Backend（Express，打包进 APK）
R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME
WX_MCHID / WX_SERIAL_NO / WX_PRIVATE_KEY_PATH / WX_APIV3_KEY / WX_APP_ID / PAYMENT_SERVER_BASE_URL
```

> ⚠️ **注意**：Web 前端已走 Vercel，这些 Secrets 只用于 GitHub Actions 构建 Android APK。

---

### 第五阶段：iOS + WearOS（等 Mac）

| 事项 | 依赖 |
|------|------|
| iOS 本地验证（Xcode）| 必须 Mac |
| iOS CI/CD（release.yml）| Mac 配置 signing |
| WearOS Phase W0 | 纯 Gradle，Windows 即可 |

---

## 今日行动清单

| # | 事项 | 预计时间 |
|---|------|---------|
| 1 | Firebase Console：创建项目 + 启用 Auth | 15 min |
| 2 | Firebase Console：下载 google-services.json → android/app/ | 5 min |
| 3 | GitHub Secrets：填入所有 VITE_FIREBASE_* | 10 min |
| 4 | 申请 Gemini API Key → 填入 VITE_GEMINI_API_KEY | 10 min |
| 5 | Cloudflare R2：创建 bucket + Token | 15 min |
| 6 | GitHub Secrets：填入 R2_* + VITE_R2_PUBLIC_URL | 5 min |
| 7 | 触发 CI（git tag）验证 APK 构建 | 5 min |

完成后 **第 1-4 项解除 Blocker，第 5-6 项解除 High**，CI 能跑出完整 APK。

---

## 文档索引

| 文档 | 用途 |
|------|------|
| `docs/MISSING_CHECKLIST.md` | 详细凭证清单 + 来源链接 |
| `docs/PAYMENT_INTEGRATION.md` | 微信支付英文集成文档 |
| `docs/IOS_PLAN.md` | iOS 搭建流程（等 Mac） |
| `docs/WEAROS_PLAN.md` | WearOS 开发计划 |
| `planning/ROADMAP.md` | 长期产品路线图 |
| `planning/NEXT_STEPS.md` | 新设备迁移指南 |
| `HANDOFF.md` | 项目交接文档 |
| `STATUS.md` | 当前模块状态 |

---

*下一步：从 Firebase Console 开始，遇到问题随时问我。*
