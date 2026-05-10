# GitHub Pages 部署指南

## 📋 当前状态

| 任务 | 状态 | 说明 |
|------|------|------|
| Firebase SDK 配置 | ✅ 完成 | google-services.json 已复制，依赖已添加 |
| ProGuard 规则 | ✅ 完成 | Firebase/Capacitor 规则已添加 |
| 隐私政策 (Markdown) | ✅ 完成 | `docs/privacy.md` |
| 隐私政策 (HTML) | ✅ 完成 | `docs/privacy.html` |
| MkDocs 配置 | ✅ 完成 | `mkdocs.yml` |
| 提交到本地 Git | ✅ 完成 | commit: d95a3e8 |
| 推送到 GitHub | ❌ 网络错误 | 需要手动推送 |
| 启用 GitHub Pages | ⏳ 待处理 | 需要在 GitHub 设置中启用 |

---

## 🚀 手动部署步骤

### Step 1: 推送提交到 GitHub

```bash
cd "d:\github projects\Thothapp"
git push origin main
```

**如果遇到网络错误**，尝试：
1. 检查代理设置：`git config --global http.proxy`
2. 使用 SSH 代替 HTTPS：
   ```bash
   git remote set-url origin git@github.com:zbbsdsb/Thothapp.git
   git push origin main
   ```

---

### Step 2: 启用 GitHub Pages

1. 访问：https://github.com/zbbsdsb/Thothapp/settings/pages
2. **Source** 选择：`Deploy from a branch`
3. **Branch** 选择：
   - Branch: `main`
   - Folder: `/docs`
4. 点击 **Save**

---

### Step 3: 获取隐私政策 URL

启用 GitHub Pages 后，以下 URL 将可用：

| 文件 | URL |
|------|-----|
| `docs/privacy.html` | `https://zbbsdsb.github.io/Thothapp/privacy.html` |
| `docs/privacy.md` | `https://zbbsdsb.github.io/Thothapp/privacy.md` |
| MkDocs 站点 (如果部署成功) | `https://zbbsdsb.github.io/Thothapp/privacy/` |

**推荐**：在 Google Play Console 中使用：
```
https://zbbsdsb.github.io/Thothapp/privacy.html
```

---

## 🔧 备选方案（如果 GitHub Pages 不可用）

### 方案 A: Vercel 托管

1. 将 `docs/privacy.html` 放到 `public/privacy.html`
2. 部署到 Vercel
3. URL: `https://thoth.app/privacy.html`

### 方案 B: 直接使用 HTML 文件

1. 将 `docs/privacy.html` 内容上传到任何静态托管服务
2. 或使用 [GitHub Gist](https://gist.github.com/) + [gist.run](https://gist.run)

### 方案 C: 临时解决方案

在 Google Play Console 中先填写：
```
https://example.com/privacy (待更新)
```

然后在实际托管完成后更新 URL。

---

## ✅ 验证清单

- [ ] `git push origin main` 成功
- [ ] GitHub Pages 已启用
- [ ] 访问 `https://zbbsdsb.github.io/Thothapp/privacy.html` 能看到隐私政策
- [ ] URL 已添加到 Google Play Console

---

*生成时间: 2026-05-10*
