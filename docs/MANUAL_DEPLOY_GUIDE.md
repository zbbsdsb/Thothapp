---
title: "Manual Deploy Guide"
description: "Guide for manually deploying docs to GitHub Pages"
category: "specs"
---
# 手动启用 GitHub Pages 指南

## 🚀 最简单的方法（5分钟搞定）

### Step 1: 在 GitHub 网页上上传文件

1. 访问：https://github.com/zbbsdsb/Thothapp/tree/main/docs
2. 点击 **Add file** → **Upload files**
3. 上传以下文件：
   - `d:\github projects\Thothapp\docs\privacy.html`
   - `d:\github projects\Thothapp\docs\index.md`
   - `d:\github projects\Thothapp\docs\privacy.md`
4. Commit message: `docs: add privacy policy for Google Play`
5. 点击 **Commit changes**

---

### Step 2: 启用 GitHub Pages

1. 访问：https://github.com/zbbsdsb/Thothapp/settings/pages
2. **Source** → 选择 `Deploy from a branch`
3. **Branch** → 选择：
   - Branch: `main`
   - Folder: `/docs`
4. 点击 **Save**

---

### Step 3: 等待部署（1-2分钟）

GitHub Pages 部署完成后，以下 URL 将可用：

| 文件 | URL |
|------|-----|
| privacy.html | `https://zbbsdsb.github.io/Thothapp/privacy.html` |
| index.md | `https://zbbsdsb.github.io/Thothapp/` |

---

### Step 4: 验证 + 填到 Play Console

1. 访问 `https://zbbsdsb.github.io/Thothapp/privacy.html`
2. 确认能看到隐私政策页面
3. 复制 URL 填到 **Google Play Console > App Content > Privacy Policy**

---

## 🔧 备选方案：如果你的网络也打不开 GitHub 网页

### 方案 A: 使用 `public/privacy.html`（推荐）

已经把 `privacy.html` 复制到了 `public/` 目录。

只要主站（Vercel）部署了，URL 就是：
```
https://thoth.app/privacy.html
```

这个 URL 可以直接填到 Google Play Console！

### 方案 B: 使用 Markdown 文件

直接把 `docs/PRIVACY.md` 的内容粘贴到 Google Play Console 的隐私政策文本框里（如果支持的话）。

---

## ✅ 当前文件状态

| 文件 | 位置 | 用途 |
|------|------|------|
| `docs/privacy.html` | ✅ 已生成 | GitHub Pages / 直接托管 |
| `docs/index.md` | ✅ 已生成 | 文档站首页 |
| `docs/privacy.md` | ✅ 已生成 | MkDocs 格式 |
| `public/privacy.html` | ✅ 已复制 | 跟随主站部署 |
| Git 提交 | ✅ commit d95a3e8 | 待推送（网络问题）|

---

*生成时间: 2026-05-10*
