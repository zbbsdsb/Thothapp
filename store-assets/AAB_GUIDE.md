# 🚀 Thoth AAB 构建完成 - 测试与上架指南

**构建时间**: 2026-05-10 10:05  
**AAB 文件**: `store-assets/thoth-v1.0-release.aab` (5.2 MB)  
**Commit**: `d4076c0` - fix: resolve build errors for Google Play release

---

## 📦 AAB 文件位置

### 1. 构建输出目录（原始文件）
```
d:\github projects\Thothapp\android\app\build\outputs\bundle\release\app-release.aab
```

### 2. 商店素材目录（复制文件）
```
d:\github projects\Thothapp\store-assets\thoth-v1.0-release.aab
```

---

## 🧪 测试 AAB 文件

### 方法 A：使用 bundletool 转换为 APK（推荐）

1. **下载 bundletool**
   ```bash
   # 从 GitHub Releases 下载最新版本
   # https://github.com/google/bundletool/releases
   # 保存到 d:\github projects\Thothapp\store-assets\bundletool.jar
   ```

2. **生成 APK 集（APK Set）**
   ```bash
   cd "d:\github projects\Thothapp\store-assets"
   java -jar bundletool.jar build-apks --bundle=thoth-v1.0-release.aab --output=thoth-v1.0-release.apks
   ```

3. **安装到连接的设备**
   ```bash
   java -jar bundletool.jar install-apks --apks=thoth-v1.0-release.apks
   ```

### 方法 B：直接构建 debug APK（快速测试）

```bash
cd "d:\github projects\Thothapp\android"
.\gradlew.bat assembleDebug
# APK 位置: android\app\build\outputs\apk\debug\app-debug.apk
```

然后安装：
```bash
adb install "d:\github projects\Thothapp\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 📸 截图步骤（使用 debug APK）

### 1. 安装 debug APK 到模拟器
```bash
# 启动模拟器（冷启动）
emulator -avd Pixel6_API34 -no-snapshot

# 等待系统启动完成后，安装 APK
adb install "d:\github projects\Thothapp\android\app\build\outputs\apk\debug\app-debug.apk"
```

### 2. 截图
根据 `store-assets\SCREENSHOT_GUIDE.md` 中的指南，截取 5-8 张截图：

1. 首页（梦境列表）
2. 录音界面（180秒倒计时）
3. AI 分析界面（转录+标签）
4. 梦境详情页
5. 全球梦境地图

**截图命令**：
```bash
# 截图并保存到当前目录
adb exec-out screencap -p > screenshot-01-home.png
```

### 3. 将截图移动到 `store-assets\screenshots\`
```bash
Move-Item screenshot-*.png "d:\github projects\Thothapp\store-assets\screenshots\"
```

---

## 🌐 上传到 Google Play Console

### 1. 登录 Google Play Console
- 访问：https://play.google.com/console
- 使用 Google 账号登录（确保已支付 $25 注册费）

### 2. 创建应用
- 点击 "Create App"
- 填写应用名称：Thoth - AI Dream Journal
- 选择语言：English (United States)
- 应用类型：Application
- 免费/付费：Free

### 3. 填写商店列表
根据 `docs\GOOGLE_PLAY_STORE_LISTING.md` 填写：

- **Short Description**: AI-powered dream journal with voice recording, analysis, and global dream map.
- **Full Description**: （复制 `GOOGLE_PLAY_STORE_LISTING.md` 中的完整描述）
- **Screenshots**: 上传 `store-assets\screenshots\` 中的截图
- **Feature Graphic**: 上传 `store-assets\feature-graphic.png`
- **Category**: Health & Fitness
- **Email**: zhaoceaser@gmail.com
- **Privacy Policy URL**: https://zbbsdsb.github.io/Thothapp/privacy.html

### 4. 上传 AAB
- 在 "Release" → "Production" 中创建新版本
- 上传 `store-assets\thoth-v1.0-release.aab`
- 填写 Release Notes（见 `docs\GOOGLE_PLAY_STORE_LISTING.md` 中的 "Release Notes" 部分）

### 5. 填写 Data Safety
根据 `docs\GOOGLE_PLAY_STORE_LISTING.md` 中的 "Data Safety Section" 表格填写。

### 6. 声明权限
根据 `docs\GOOGLE_PLAY_STORE_LISTING.md` 中的 "Permissions Declaration" 表格填写。

### 7. 完成内容分级问卷
- 回答问卷（Google Play Console 自动生成）
- 预期分级：Everyone（全年龄）

### 8. 提交审核
- 点击 "Send for Review"
- 等待 Google 审核（通常 1-3 天）

---

## ✅ 上架前检查清单

- [x] AAB 构建成功
- [x] Feature Graphic 已创建
- [x] 隐私政策 URL 可访问
- [ ] 截图已捕获（5-8 张）
- [ ] AAB 已测试（使用 bundletool 或 debug APK）
- [ ] Google Play Console 账号已准备
- [ ] 商店列表已填写
- [ ] Data Safety 已填写
- [ ] 权限已声明
- [ ] 内容分级问卷已完成
- [ ] AAB 已上传到 Play Console
- [ ] 提交审核

---

## 📝 注意事项

1. **AAB 大小**: 5.2 MB，远小于 150MB 限制 ✅
2. **签名密钥**: **备份 `android/app/thoth-upload-key.jks`！** 丢失后无法更新应用
3. **版本号**: 首次发布使用版本号 1，版本名称 "1.0"
4. **审核时间**: 首次提交审核可能需要 3-7 天，请耐心等待
5. **测试**: 上传前使用 `bundletool` 测试 AAB 安装

---

## 📞 紧急联系

- **技术支持**: zhaoceaser@gmail.com
- **Google Play 开发者支持**: https://support.google.com/googleplay/android-developer/

---

**Good luck with the launch! 🚀**
