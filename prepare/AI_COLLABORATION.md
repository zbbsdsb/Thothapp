# AI 协同工作手册 — WorkBuddy & Trae 分工指南

> 本文档同时面向 WorkBuddy 和 Trae，用于在两个 AI 工具之间建立统一的上下文和分工协议。
> 最后更新：2026-05-11

---

## 一、关于这位开发者

- **称呼**：Name（GitHub: zbbsdsb）
- **语言偏好**：中文交流，代码/提交信息/文件命名严格使用英文
- **工作风格**：系统性、分阶段、有条理；任务完成后自主提交，提交信息使用英文；偏好表格 + 结构化输出
- **输出偏好**：简洁结构化，表格形式，配合详细代码示例

---

## 二、当前活跃项目

### 项目 1：Thoth — AI 驱动梦境日记 App
| 属性 | 详情 |
|------|------|
| 类型 | Android + WearOS 原生应用 |
| 技术栈 | Kotlin / Jetpack Compose / Firebase / Gradle Kotlin DSL |
| 包名 | `com.thoth.dreamarchive` |
| 仓库 | `d:\github projects\Thothapp` |
| 目标 | Google Play 上架（AAB 签名、商店列表、隐私政策、截图） |
| 应用名 | 已从中文改为英文，面向国际发布 |
| 未来计划 | iOS 版、Linux 版，相关法律文档提前准备中 |

**WearOS 模块当前状态（Phase W1 已完成，W2/W3 待实现）：**
- ✅ RecordingScreen / ViewModel / AudioRecorderService / FirebaseRepository / Dream model 代码完整
- ❌ **关键问题**：Firebase 未初始化 → App 启动崩溃
- ❌ DreamListScreen：硬编码占位符（TODO），DreamListViewModel 骨架未连接
- 📄 详细交接文档：`docs/WEAROS_HANDOVER.md`（英文，2026-05-10）

---

### 项目 2：OasisBio — 个人网站 / Bio 页面
| 属性 | 详情 |
|------|------|
| 类型 | Web 应用 |
| 技术栈 | Next.js 15+ / Prisma 6.x / TypeScript |
| 当前问题 | 约 118 个 TypeScript 错误，采用增量分阶段修复策略 |
| 提交风格 | 分阶段提交，每阶段完成后单独 commit |

---

## 三、分工原则

### 核心原则
> **WorkBuddy 负责"思考密集型"任务，Trae 负责"执行密集型"任务**
> 
> 推荐工作流：WorkBuddy 出方案 → Trae 按方案实现 → WorkBuddy 复查复杂问题

---

### 明确分配给 WorkBuddy 的任务

| 场景 | 原因 |
|------|------|
| 跨 3 个以上文件的修改或重构 | 需要全局视野和跨文件上下文 |
| 复杂 bug 定位（跨层/跨模块） | 多文件推理能力强 |
| 新功能架构设计 / 技术选型 | 综合判断 + 记忆历史决策 |
| 批量 TypeScript 错误修复（OasisBio） | 需要系统性策略，避免修一处坏另一处 |
| 需要执行命令（gradle、adb、git、shell） | 有系统访问权限 |
| 需要联系历史上下文 / 先前决策 | WorkBuddy 有跨会话记忆 |
| 自动化脚本 / 数据分析 / 报告生成 | 工具链完整 |
| 方案规划（Plan 模式）| 出详细计划供 Trae 执行 |

---

### 明确分配给 Trae 的任务

| 场景 | 原因 |
|------|------|
| 日常代码补全 | 免费/低成本，够用 |
| 单文件函数修改 | 不需要跨文件上下文 |
| 按照 WorkBuddy 方案逐文件实现 | 执行型任务，模式清晰 |
| 写重复性样板代码（CRUD、数据类等） | 模式固定，Trae 可胜任 |
| 添加注释 / 文档字符串 | 低复杂度体力活 |
| 快速语法查询 / 单点问答 | 不需要记忆和推理 |
| 已有接口的实现填充 | 接口已定义，只需实现 |

---

## 四、推荐协同工作流

### 标准工作流（新功能开发）
```
Step 1  WorkBuddy   分析需求，输出实现方案 + 文件结构 + 伪代码
Step 2  Trae        按方案逐文件实现（复制方案内容作为 prompt）
Step 3  Trae        补全样板代码、注释
Step 4  WorkBuddy   复查：检查跨文件一致性、集成问题、复杂 bug
Step 5  WorkBuddy   执行 gradle build / git commit（需要命令时）
```

### Bug 修复工作流
```
Step 1  Trae        先尝试（单文件 bug，Trae 通常能搞定）
        ↓ 搞不定？
Step 2  WorkBuddy   跨层分析，给出根因 + 修复方案
Step 3  Trae        按方案修复
```

### OasisBio TypeScript 错误修复工作流
```
Step 1  WorkBuddy   按模块分批规划修复顺序和策略
Step 2  Trae        按批次逐文件修复
Step 3  WorkBuddy   阶段性验收 + 下一批规划
```

---

## 五、节省 WorkBuddy Credit 的技巧

1. **用 Plan 模式代替 Craft 模式**：先让 WorkBuddy 规划，确认后再执行
2. **压缩上下文再提问**：用 Trae 整理关键信息，再粘给 WorkBuddy，减少文件读取开销
3. **批量问题合并提问**：多个小问题合一条请求，避免多次建立上下文
4. **记录重要决策到 MEMORY.md**：WorkBuddy 记住后，下次无需重新解释背景
5. **简单任务坚决用 Trae**：参考上方分工表，不为小任务消耗 WorkBuddy credit

---

## 六、给两个 AI 的特别提示

### 给 WorkBuddy
- 用户有跨会话记忆，请在每次完成实质性工作后更新 `.workbuddy/memory/` 中的记忆文件
- 用户喜欢系统性分阶段工作，请主动提示当前处于哪个阶段，以及下一步是什么
- 代码/提交信息/文件名一律英文，交流使用中文
- 给出方案时，明确标注哪些步骤可以交给 Trae 执行

### 给 Trae
- 当遇到跨多文件的复杂问题时，建议用户切换到 WorkBuddy
- 执行 WorkBuddy 给出的方案时，严格按照方案执行，不要擅自改变架构决策
- 如果某个任务你不确定，宁可说"建议让 WorkBuddy 来处理"，也不要给出不稳定的方案
- 记住：用户偏好英文 commit message，中文交流

---

*本文档由 WorkBuddy 生成，建议在两个工具的工作区中均保留一份。*
