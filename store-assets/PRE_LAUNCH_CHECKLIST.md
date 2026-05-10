# ✅ Thoth - Google Play 上架前最终检查清单

**生成时间**: 2026-05-10  
**目标**: 10:00 前完成所有准备工作

---

## 🔴 紧急待办（Blocking）

### 1. 构建签名 AAB 包
- [ ] 等待 SDK 配置完成
- [ ] 执行 `cd android; .\gradlew.bat bundleRelease`
- [ ] 确认 AAB 文件生成在 `android\app\build\outputs\bundle\release\`
- [ ] 测试 AAB 安装（使用 `bundletool`）

**负责**: 用户配置完 SDK 后执行

---

### 2. 拍摄应用截图（5-8 张）
- [ ] 01 - 首页（梦境列表）
- [ ] 02 - 录音界面（180秒倒计时）
- [ ] 03 - AI 分析界面（转录+标签）
- [ ] 04 - 梦境详情页
- [ ] 05 - 全球梦境地图
- [ ] （可选）06 - 设置页面
- [ ] （可选）07 - 个人资料页

**截图指南**: 见 `store-assets\SCREENSHOT_GUIDE.md`  
**负责**: SDK 配置完成后，构建 APK/AAB 并安装到模拟器或真机截图

---

## 🟡 重要待办（Important）

### 3. 确认隐私政策 URL 可访问
- [ ] 访问 https://zbbsdsb.github.io/Thothapp/privacy.html
- [ ] 确认页面正常加载，无 404
- [ ] 确认内容与 `docs\PRIVACY.md` 一致

**状态**: ✅ 已完成（用户确认可访问）

---

### 4. 准备 Google Play Console 账号
- [ ] 确认 Google Play Console 账号已注册（25美元一次性费用）
- [ ] 确认信用卡/支付方式已绑定
- [ ] 准备好开发者名称（个人/公司）

**负责**: 用户确认

---

### 5. 填写 Google Play Console 商店列表
根据 `docs\GOOGLE_PLAY_STORE_LISTING.md` 填写：

- [ ] **App Name**: Thoth - AI Dream Journal
- [ ] **Short Description**: AI-powered dream journal with voice recording, analysis, and global dream map.
- [ ] **Full Description**: （复制 `GOOGLE_PLAY_STORE_LISTING.md` 中的完整描述）
- [ ] **Screenshots**: 上传 5-8 张截图
- [ ] **Feature Graphic**: 上传 `store-assets\feature-graphic.png`
- [ ] **App Icon**: 自动从 AAB 提取（确认 `ic_launcher.png` 存在）
- [ ] **Category**: Health & Fitness
- [ ] **Tags**: dream journal, AI, sleep, dreams, Gemini, voice recording
- [ ] **Website**: https://thoth.app （或 GitHub Pages URL）
- [ ] **Email**: zhaoceaser@gmail.com
- [ ] **Privacy Policy URL**: https://zbbsdsb.github.io/Thothapp/privacy.html

---

### 6. 填写 Data Safety 部分（Play Console）
根据 `GOOGLE_PLAY_STORE_LISTING.md` 中的表格填写：

- [ ] **Data Collection**: 确认收集的數據類型（姓名、邮箱、音频、文本）
- [ ] **Purpose**: 确认用途（账户认证、梦境记录、AI 分析）
- [ ] **Shared with third parties?**: 否（除 Gemini API 处理外）
- [ ] **Can users delete data?**: 是
- [ ] **Security Practices**: 
  - [x] Data encrypted in transit
  - [x] Data encrypted at rest
  - [x] Users can request data deletion

---

### 7. 声明权限（Play Console）
- [ ] **RECORD_AUDIO**: 允许，用于录制梦境语音备忘录
- [ ] **INTERNET**: 允许，用于 Firebase 同步和 AI 处理
- [ ] **ACCESS_FINE_LOCATION**: 可选，用于标记梦境位置
- [ ] **POST_NOTIFICATIONS**: 可选，用于 Memory Collapse 提醒
- [ ] **FOREGROUND_SERVICE**: 允许，用于录音通知
- [ ] **FOREGROUND_SERVICE_MICROPHONE**: 允许，用于录音通知

---

### 8. 内容分级问卷（Content Rating）
- [ ] 回答问卷（Google Play Console 自动生成）
- [ ] **预期分级**: Everyone（全年龄）或 Teen（如果梦境内容涉及敏感话题）
- [ ] 确认无暴力、色情、仇恨言论等内容

---

## 🟢 可选优化（Nice to Have）

### 9. Promo Video（宣传视频）
- [ ] 录制 30 秒演示视频
- [ ] 上传到 YouTube
- [ ] 在 Play Console 填写 YouTube URL

**优先级**: 低（可在首次发布后补充）

---

### 10. Tablet Screenshots（平板截图）
- [ ] 捕获 7 寸和 10 寸平板截图
- [ ] 上传到 Play Console（可选）

**优先级**: 低

---

### 11. 多语言本地化
- [ ] 翻译商店列表为中文、西班牙语、日语等
- [ ] 上传本地化截图

**优先级**: 低（可在后续版本添加）

---

## 📦 技术检查（已修复）

### 12. Firebase SDK 配置
- [x] `google-services.json` 已放置到 `android/app/`
- [x] Firebase BoM 依赖已添加到 `android/app/build.gradle`
- [x] Firebase SDK 版本统一（避免冲突）

### 13. ProGuard 规则
- [x] `android/app/proguard-rules.pro` 已添加 Firebase/Capacitor 规则

### 14. 签名配置
- [x] `keystore.properties` 已配置（假设存在）
- [ ] **确认**: 执行 `.\gradlew.bat bundleRelease` 时能够成功签名

### 15. targetSdkVersion
- [x] 已设置为 36（Google Play 要求）

---

## 📊 当前进度

| 类别 | 完成度 | 备注 |
|------|--------|------|
| **技术准备** | 90% | 等待 SDK 配置完成，构建 AAB |
| **商店素材** | 60% | Feature Graphic 完成，截图待捕获 |
| **合规文档** | 100% | 隐私政策已托管，Data Safety 已准备 |
| **Play Console 填写** | 0% | 等待 AAB 构建完成后开始 |

---

## 🚀 上架流程（Play Console）

1. **创建应用**
   - 登录 https://play.google.com/console
   - 点击 "Create App"
   - 填写应用名称、语言、应用类型、免费/付费

2. **填写商店列表**
   - 上传截图、Feature Graphic
   - 填写描述、关键词
   - 设置分类、联系方式

3. **上传 AAB**
   - 拖拽 `app-release.aab` 到 Play Console
   - 等待处理完成

4. **填写 Data Safety**
   - 回答数据收集问题
   - 声明安全实践

5. **声明权限**
   - 解释为什么需要每个权限

6. **完成内容分级问卷**

7. **提交审核**
   - 点击 "Send for Review"
   - 等待 Google 审核（通常 1-3 天）

---

## 📝 注意事项

1. **AAB 大小**: 确保低于 150MB，或使用 Play Asset Delivery
2. **测试**: 上传前使用 `bundletool` 测试 AAB 安装
3. **版本号**: 首次发布使用版本号 1，版本名称 "1.0"
4. **签名密钥**: **备份 release 签名密钥！** 丢失后无法更新应用
5. **审核时间**: 首次提交审核可能需要 3-7 天，请耐心等待

---

## 📞 紧急联系

- **技术支持**: zhaoceaser@gmail.com
- **Google Play 开发者支持**: https://support.google.com/googleplay/android-developer/

---

**Good luck! 🚀**
