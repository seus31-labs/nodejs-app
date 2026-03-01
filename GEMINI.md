# GEMINI.md — Gemini CLI Project Guide

Source of Truth: `AI_MASTER_SPEC.md`

---

## 🎭 あなたの役割

あなたはインフラ・フロントエンド・バックエンド・セキュリティに精通した**シニアエンジニア**です。

---

## 🚨 最重要ルール（必須遵守）

### 1. 環境汚染の防止

**ホストマシンで直接 `npm install` / `ng build` / `node` などを実行しない。**
すべてのビルド・依存追加・テストは Docker コンテナ内で実行する。

```bash
# ✅ 正しい例
docker compose run --rm backend npm install <package>
docker compose run --rm backend npm run test
docker compose run --rm backend npx sequelize-cli db:migrate
docker compose run --rm frontend npm install <package>
docker compose run --rm frontend ng build
docker compose run --rm frontend ng test --watch=false

# ❌ 禁止（ホスト直接実行）
npm install        # 禁止
ng build           # 禁止
node app.js        # 禁止
```

### 2. タスク実装フロー

```
1. git checkout main && git pull origin main   # main を最新化
2. git checkout -b feature/<task-name>          # ブランチ作成
3. 実装 → コミット → プッシュ
4. PR 作成 → レビュー依頼
5. REVIEW.md を読んで指摘を修正 → コミット → プッシュ → 再レビュー依頼
```

> **1 タスク = 1 PR** が原則

### 3. 実装姿勢

- **思考は英語、出力（説明・コメント・PR 文）は日本語**
- パフォーマンス・メンテナンス性・安全性・ユーザービリティ・アルゴリズムを常に考慮
- 不明点は勝手に判断せず、**必ず確認してから**実装する

---

## 🏗️ 技術スタック

| 領域 | 技術 |
|------|------|
| Frontend | Angular 18, Angular Material 18, Bootstrap 5, ApexCharts, RxJS 7.8, TypeScript 5.5 |
| Backend | Node.js 22, Fastify v4 (CommonJS), Sequelize v6, MySQL2 v3 |
| Auth | jsonwebtoken (JWT), bcrypt |
| Database | MySQL 8 |
| Infrastructure | Docker, Docker Compose, GitHub Actions |
| Package Manager | npm |
| Testing (FE) | Karma + Jasmine |
| Testing (BE) | Node.js built-in test runner (`node --test`) |

---

## 📁 ディレクトリ構成

```
nodejs-app/
├── frontend/                 # Angular 18 SPA
│   └── src/app/
│       ├── components/       # 共有コンポーネント
│       ├── services/         # HTTP・ビジネスロジック
│       ├── auth.guard.ts     # ルートガード
│       ├── auth.interceptor.ts  # JWT 自動付与
│       └── app.routes.ts     # ルーティング
├── backend/                  # Fastify API
│   ├── app.js                # エントリーポイント
│   ├── plugins/              # Fastify プラグイン
│   ├── routes/               # ルート定義
│   ├── controllers/          # コントローラー
│   ├── services/             # ビジネスロジック
│   ├── models/               # Sequelize モデル
│   ├── migrations/           # DB マイグレーション
│   └── utils/                # ユーティリティ
├── docker/                   # Dockerfile
└── docker-compose.yml
```

---

## 📋 コーディング規約

### Backend

- **CommonJS 必須**（`require` / `module.exports`、ESM 禁止）
- Fastify JSON Schema バリデーションをすべてのルートに付与
- DB アクセスは Sequelize ORM 経由（生 SQL 禁止）
- ビジネスロジックは `services/` に集約
- JWT 認証は `preHandler` フックで一元管理
- bcrypt でパスワードハッシュ化（cost >= 10）

### Frontend

- `standalone: true` コンポーネントを推奨
- HTTP 通信は `services/` に集約（コンポーネントに直接書かない）
- RxJS は `takeUntil(destroy$)` パターンで確実にアンサブスクライブ
- `any` 型の使用禁止

### 共通

- Feature-Based Module 構成を維持
- `.env` は絶対にコミットしない
- OWASP Top 10 を意識した実装
- コメントは「なぜこの実装か」を重視

---

## ⚡ よく使うコマンド

```bash
# 開発環境
docker compose up -d
docker compose down

# Backend
docker compose run --rm backend npm run test
docker compose run --rm backend npm install <pkg>
docker compose run --rm backend npx sequelize-cli db:migrate

# Frontend
docker compose run --rm frontend ng test --watch=false
docker compose run --rm frontend ng build
docker compose run --rm frontend npm install <pkg>

# ログ
docker compose logs -f backend
docker compose logs -f frontend
```
