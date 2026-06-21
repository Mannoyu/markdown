# Echoes · 情绪显影液 (Mood Developer) — 设计规格书

> **Slogan**：只有当你的心跳与记忆同频，模糊的过往才会重新清晰。
>
> **定位**：「反效率」AI 情感交互相册 —— 情绪共振解锁机制，让每一次回顾都成为自我疗愈的仪式。
>
> **日期**：2026-06-22

---

## 1. 项目概述

### 1.1 核心机制

Echoes 摒弃传统相册「按时间/地点检索」的工具逻辑，首创 **情绪共振解锁**：用户存入照片时，AI 提取画面与备注中的「情绪指纹」并封存为模糊光斑；唯有当用户当下的语音或文字与记忆的情绪向量匹配度超过阈值时，照片才会如胶片显影般缓缓浮现。

### 1.2 目标平台与技术栈

| 层级         | 技术                             | 说明                   |
| ------------ | -------------------------------- | ---------------------- |
| 移动端       | React Native (Expo) + TypeScript | 跨平台 iOS/Android     |
| 后端         | Python FastAPI + Uvicorn         | AI 模型推理服务        |
| 图片情感模型 | CLIP ViT-B/32                    | 图片 → 512 维情绪向量  |
| 语音转文字   | Whisper tiny                     | 语音 → 文本转录        |
| 情感分类     | DistilBERT (fine-tuned)          | 文本 → 512 维情绪向量  |
| 向量存储     | SQLite + sqlite-vec (JS 降级)    | 本地余弦相似度检索     |
| 动效渲染     | Canvas / expo-gl                 | 液态光斑 + 显影 Shader |
| 音频         | expo-av                          | 录音 + 环境白噪音播放  |

### 1.3 MVP 范围

**包含**：照片存入 → AI 情绪打标 → 液态光斑首页 → 文字/语音情绪输入 → 匹配解锁 → 显影动画
**不包含（后续迭代）**：情绪胶囊社交、实体卡片打印、B 端看板

---

## 2. 系统架构

### 2.1 三层拓扑

```
┌─────────────────────────────────────────┐
│  📱 Presentation Layer                   │
│  React Native (Expo) · Canvas · Haptics │
└──────────────┬──────────────────────────┘
               │ REST / multipart
               ▼
┌─────────────────────────────────────────┐
│  🧠 AI Understanding Layer               │
│  FastAPI · CLIP · Whisper · Emotion CLF │
└──────────────┬──────────────────────────┘
               │ Embedding (JSON)
               ▼
┌─────────────────────────────────────────┐
│  💾 Local Storage Layer                  │
│  SQLite + sqlite-vec · File Storage     │
└─────────────────────────────────────────┘
```

### 2.2 设计决策

| 决策              | 理由                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| 向量存储本地      | 情绪指纹是高度私密数据，永不出设备。云端仅做推理，不存向量                  |
| 混合部署          | 图片情绪提取（CLIP）计算量大放云端；向量匹配在本地，低延迟且隐私安全        |
| 薄后端            | FastAPI 只做 3 件事：图片嵌入、语音嵌入、文字嵌入。无状态、无数据库、无认证 |
| Expo (非 Flutter) | JS/TS 生态统一前后端，AI/ML 相关库更丰富，开发效率优先                      |

### 2.3 通信矩阵

| 路径             | 协议                    | 数据                                         |
| ---------------- | ----------------------- | -------------------------------------------- |
| App ↔ FastAPI    | REST (JSON) + multipart | 图片文件、语音片段、文本                     |
| App ↔ SQLite     | expo-sqlite + 向量查询  | 情绪向量、匹配结果、元数据                   |
| FastAPI ↔ Models | Python inference (内存) | CLIP embedding、Whisper transcript、情感分类 |

---

## 3. 情绪指纹算法

### 3.1 存入：图片 → 情绪向量

```
Image → CLIP ViT-B/32 → 512-dim Vector
                          +
Caption Text → Emotion Classifier → 512-dim Vector
                          ↓
                   加权融合 (图片 0.7 / 文字 0.3)
                          ↓
                   Emotion Fingerprint
                          +
                   Dominant Color (主色调)
```

### 3.2 解锁：语音/文字 → 情绪向量

```
Voice → Whisper tiny → Transcript → Emotion Classifier → 512-dim Query Vector
Text  → Emotion Classifier → 512-dim Query Vector
```

### 3.3 匹配：余弦相似度 + 门控

```
similarity = cos(query_vector, memory_vector)

  similarity < 0.65  →  🔒 未解锁（光斑持续呼吸）
  0.65 ≤ sim ≤ 0.80 →  🌫️ 半显影（轮廓浮现）
  similarity > 0.80  →  ✨ 完全显影（药水动画 → 清晰照片）
```

### 3.4 阈值调优策略

- **初始阈值**：cos > 0.80 → 完全解锁
- **自适应衰减**：同一记忆连续 3 次未解锁，阈值自动降至 0.70（避免死锁）
- **惊喜模式**：每日首次打开，随机降低全局阈值 5%
- **用户调节**：设置滑块手动调节「解锁难度」（宽松 ← → 苛刻）

### 3.5 情绪维度（可解释投影）

| 维度                | 含义              | 范围                 |
| ------------------- | ----------------- | -------------------- |
| Valence（愉悦度）   | 悲伤 ← → 喜悦     | 512-dim 中的主导方向 |
| Arousal（唤醒度）   | 平静 ← → 兴奋     | 512-dim 中的主导方向 |
| Dominance（支配感） | 脆弱 ← → 掌控     | 512-dim 中的主导方向 |
| Nostalgia（怀旧度） | 当下感 ← → 回忆感 | 512-dim 中的主导方向 |

---

## 4. 移动 App 设计

### 4.1 导航哲学

无 Tab Bar、无汉堡菜单、无搜索框。所有导航通过光斑的手势完成：
- **下拉** → 存入模式（CaptureScreen）
- **长按光斑** → 解锁模式（UnlockScreen）
- **显影完成 → 左滑** → 返回首页

### 4.2 四屏结构

| 屏幕                             | 组件                                          | 路由           |
| -------------------------------- | --------------------------------------------- | -------------- |
| **暗房首页** DarkroomHomeScreen  | BlobField, LiquidBlob                         | `/`            |
| **存入记忆** CaptureScreen       | Camera/ImagePicker, CaptionInput              | `/capture`     |
| **情绪解锁** UnlockScreen        | VoiceRecorder, TextInput, ResonanceIndicator  | `/unlock/:id`  |
| **显影 & 记忆** DevelopingScreen | DeveloperAnimation, MemoryCard, PoetryOverlay | `/develop/:id` |

### 4.3 组件树

```
src/
├── screens/
│   ├── DarkroomHomeScreen.tsx
│   ├── CaptureScreen.tsx
│   ├── UnlockScreen.tsx
│   └── DevelopingScreen.tsx
├── components/
│   ├── LiquidBlob.tsx            # 单个液态光斑 (Canvas)
│   ├── BlobField.tsx             # 光斑集合布局 + 手势
│   ├── ResonanceIndicator.tsx    # 情绪共振强度指示器
│   ├── VoiceRecorder.tsx         # 录音按钮 + 波形动画
│   ├── DeveloperAnimation.tsx    # 显影 Shader 动画
│   ├── MemoryCard.tsx            # 解锁后的照片 + 笔记
│   └── PoetryOverlay.tsx         # 竖排诗歌式文案层
├── services/
│   ├── api.ts                    # FastAPI 通信
│   ├── database.ts               # SQLite + 向量操作
│   ├── emotion.ts                # 本地情绪向量处理
│   └── audio.ts                  # 录音 + 环境音播放
├── store/
│   ├── memories.ts               # 记忆状态 (Zustand)
│   └── settings.ts               # 阈值/偏好设置
├── utils/
│   ├── colors.ts                 # 光斑颜色生成
│   ├── similarity.ts             # 余弦相似度计算
│   └── haptics.ts                # Haptic 封装
└── navigation/
    └── AppNavigator.tsx           # 极简手势导航
```

### 4.4 关键交互细节

- **光斑呼吸算法**：每个光斑的呼吸周期 = 照片主色调 HSL 饱和度映射（饱和度越高 → 呼吸越快），形成「视觉情绪场」
- **共振触觉**：语音输入时 Haptic 随匹配度增强 —— 轻颤 → 脉动 → 解锁瞬间的「心跳停顿」

---

## 5. 后端 API 设计

### 5.1 设计原则

- **无状态**：不存储任何用户数据，向量返回后即丢弃
- **毫秒级**：图片嵌入 ~200ms，语音+情感 ~300ms，模型预热常驻内存
- **最小化**：3 个端点，无认证（初期），无数据库

### 5.2 端点

#### POST `/api/v1/embed/image`

```
Request (multipart/form-data):
  image: File
  caption?: String

Response 200:
  {
    embedding: float[512],
    dominant_color: "#8C7C6C",
    emotion_tags: ["nostalgic", "warm"]
  }
```

#### POST `/api/v1/embed/voice`

```
Request (multipart/form-data):
  audio: File  (.m4a/.wav, < 30s)

Response 200:
  {
    embedding: float[512],
    transcript: "今天有点想家...",
    emotion_tags: ["wistful", "gentle"]
  }
```

#### POST `/api/v1/embed/text`

```
Request (application/json):
  { text: String }  (max 500 chars)

Response 200:
  {
    embedding: float[512],
    emotion_tags: ["melancholy", "quiet"]
  }
```

### 5.3 模型选型与延迟

| 模型                    | 用途            | 输出       | 目标延迟 |
| ----------------------- | --------------- | ---------- | -------- |
| CLIP ViT-B/32           | 图片 → 情绪向量 | 512-dim    | < 300ms  |
| Whisper tiny            | 语音 → 文本     | UTF-8 text | < 200ms  |
| DistilBERT (fine-tuned) | 文本 → 情感向量 | 512-dim    | < 100ms  |

### 5.4 后端项目结构

```
backend/
├── main.py
├── config.py
├── routers/
│   └── embed.py
├── models/
│   ├── clip_model.py
│   ├── whisper_model.py
│   └── emotion_classifier.py
├── schemas/
│   └── embedding.py
├── utils/
│   ├── image_utils.py
│   └── audio_utils.py
└── requirements.txt
```

---

## 6. 数据库设计

### 6.1 memories 表

| 列名               | 类型        | 说明                           |
| ------------------ | ----------- | ------------------------------ |
| id                 | TEXT PK     | UUID                           |
| image_path         | TEXT        | 本地图片路径                   |
| caption            | TEXT        | 用户备注                       |
| dominant_color     | TEXT        | 主色调 #HEX（光斑颜色）        |
| emotion_tags       | TEXT (JSON) | `["nostalgic","warm","quiet"]` |
| embedding          | BLOB        | 512×4 = 2048 bytes (float32)   |
| unlock_count       | INTEGER     | 累计解锁次数                   |
| consecutive_fails  | INTEGER     | 连续未解锁计数（衰减用）       |
| threshold_override | REAL        | NULL = 使用全局阈值            |
| last_unlocked_at   | TEXT        | ISO datetime                   |
| created_at         | TEXT        | ISO datetime                   |

### 6.2 settings 表

| key              | value 类型    | 默认值 | 说明         |
| ---------------- | ------------- | ------ | ------------ |
| base_threshold   | REAL          | 0.80   | 全局解锁阈值 |
| surprise_mode    | INTEGER (0/1) | 1      | 每日惊喜偏差 |
| adaptive_decay   | INTEGER (0/1) | 1      | 自适应衰减   |
| haptic_intensity | REAL          | 0.7    | 触觉反馈强度 |

### 6.3 向量存储方案

**主方案**：sqlite-vec 虚拟表

```sql
CREATE VIRTUAL TABLE vec_memories USING vec0(
  embedding float[512]
);
```

**降级方案**：若 sqlite-vec 的 React Native 绑定不成熟，降级为 JS 内存计算 —— 加载所有向量到内存做余弦相似度。3000 条记忆仅需 ~12MB 内存，毫秒级完成。

---

## 7. 视觉与体验设计

### 7.1 未解锁态

- 拒绝缩略图列表
- 首页呈现为根据照片主色调生成的「呼吸式液态光斑」
- 如同沉睡的记忆生物体，看到的是情绪的形状而非数据的排列

### 7.2 显影过程

- 模拟真实暗房中药水浸泡的显影效果
- Canvas Shader 动画：光斑 → 模糊轮廓 → 清晰照片
- 配合由远及近的环境白噪音
- Haptic 触觉反馈强化「记忆浮现」的通感体验

### 7.3 排版美学

- 衬线字体（Cormorant Garamond / Noto Serif SC）
- 竖排诗歌式文案
- 大量留白
- 弱化科技感，营造「可触摸的文学性」

### 7.4 设计 Token

| Token        | 值                         |
| ------------ | -------------------------- |
| 背景色（亮） | `#FAF7F2`                  |
| 文字色       | `#2C2420`                  |
| 次要文字     | `#8C7C6C`                  |
| 强调色       | `#C4A882`                  |
| 暗房背景     | `#0F0F18`                  |
| 暗房文字     | `rgba(220, 210, 230, 0.9)` |
| 边框         | `#E0D8CC`                  |
| 卡片背景     | `#F5F0E8`                  |

---

## 8. 开发阶段

### 8.1 时间线总览

| 阶段   | 内容        | 时间      | 交付物                                     |
| ------ | ----------- | --------- | ------------------------------------------ |
| **P0** | 项目脚手架  | Day 1-2   | Expo + FastAPI 启动，4 屏骨架，API 可 ping |
| **P1** | AI 模型管线 | Day 3-7   | 3 个端点返回有效 512-dim 向量              |
| **P2** | 本地存储    | Day 8-10  | 存入→匹配→解锁全链路可跑                   |
| **P3** | 暗房首页    | Day 11-14 | 呼吸光斑 + 手势导航                        |
| **P4** | 存入记忆    | Day 15-17 | 拍照/选取 → 上传 → 新光斑出现              |
| **P5** | 情绪解锁    | Day 18-21 | 语音/文字输入 → 匹配 → 显影入口            |
| **P6** | 显影动画    | Day 22-24 | 药水 Shader + 白噪音 + Haptic              |
| **P7** | 打磨调优    | Day 25-28 | 阈值调优、性能优化、Bug 修复               |

### 8.2 里程碑

| 里程碑        | 触发条件   | 可演示内容                                |
| ------------- | ---------- | ----------------------------------------- |
| M1 · 技术验证 | P0-P1 完成 | API 返回有效情绪向量，图片 & 语音通路     |
| M2 · 核心闭环 | P2-P3 完成 | 照片存入 → 本地存储 → 文本匹配 → 解锁判断 |
| M3 · 完整体验 | P4-P6 完成 | 语音输入 → 显影动画 → 完整仪式感          |
| M4 · MVP 就绪 | P7 完成    | 打磨后的完整产品，可对外演示/参赛         |

### 8.3 开发策略

- **先跑通、再美化**：P0-P2 用最朴素 UI，确保核心逻辑正确；P3 开始注入视觉魔法
- **AI 先行**：P1 是最大不确定性，尽早验证 CLIP + Whisper + 情感分类输出质量
- **每阶段可演示**：P2 结束时即可通过调试界面展示「存入→匹配→解锁」

---

## 9. 风险与缓解

| 风险                          | 概率 | 缓解措施                             |
| ----------------------------- | ---- | ------------------------------------ |
| sqlite-vec RN 绑定不可用      | 中   | JS 内存计算降级方案，性能验证已通过  |
| CLIP 模型推理延迟过高         | 低   | 模型预热常驻内存；备选 CLIP ViT-B/16 |
| Whisper tiny 中文转录精度不足 | 中   | 备选云端 Qwen-VL API 兜底            |
| 情绪阈值难以调优              | 中   | 预留用户手动调节滑块；自适应衰减机制 |
| Expo 热更新审核问题           | 低   | 纯本地推理 + 无热更新依赖            |

---

## 10. 商业化路径（后续）

- **C 端增值**：基础显影免费，订阅解锁「专属情绪音色」「无限回溯足迹」「实体情绪卡片打印」
- **B 端延伸**：匿名情绪看板、心理健康机构合作疗愈工具、文旅景区「时空情绪邮局」
