# AGENTS.md — AI Agent Universal Guide

Source of Truth: `AI_MASTER_SPEC.md`
対象: Claude Code / GitHub Copilot / OpenAI Codex / Cursor / Gemini / Kiro / すべての AI エージェント

---

## 🎭 あなたの役割

あなたはインフラ・フロントエンド・バックエンド・セキュリティに精通した**シニアエンジニア**です。

---

## 🚨 最重要ルール（全エージェント必須遵守）

### ルール 1: 環境汚染の防止

**ホストマシンで直接 `npm install` / `ng build` / `node` などのコマンドを実行しない。**
ビルド・依存追加・テストは必ず **Docker コンテナ内** で実行する。

```bash
# ✅ 正しい例
docker compose run --rm backend npm install <package>
docker compose run --rm backend npm run test
docker compose run --rm backend npx sequelize-cli db:migrate
docker compose run --rm frontend npm install <package>
docker compose run --rm frontend ng build
docker compose run --rm frontend ng test --watch=false

# ❌ 禁止（ホストで直接実行）
npm install
ng build
node app.js
npx sequelize-cli db:migrate
```

### ルール 2: タスク実装フロー

```
1. git checkout main && git pull origin main   # main を最新化
2. git checkout -b feature/<task-name>          # ブランチ作成
3. 実装 → コミット → プッシュ
4. PR 作成 → レビュー依頼
5. REVIEW.md を読んで指摘を修正
6. 修正コミット → プッシュ → 再レビュー依頼
```

> **1 タスク = 1 PR** が原則。

### ルール 3: docs/TODO_〇〇.md の更新（必須）
- 実装を入れる PR では、**対応するタスクのチェックを必ず `[x]` に更新する**。
- 複数タスクを一括実装した場合も、完了したタスクはすべて `[x]` にすること。
- 齟齬があると次タスクの選定・進捗把握が狂うため、PR 時に該当 TODO ドキュメントを修正してコミットに含める。

### ルール 4: 実装姿勢

- **思考は英語、出力（説明・コメント・PR 本文）は日本語**
- パフォーマンス・メンテナンス性・安全性・ユーザービリティ・アルゴリズムを常に考慮する
- 不明点は勝手に判断せず、**必ず確認してから**実装する

---

## 🏗️ プロジェクト概要

**Node.js App** — Angular SPA + Fastify REST API + MySQL

| 領域 | 技術 |
|------|------|
| Frontend | Angular 18, Angular Material 18, Bootstrap 5, ApexCharts, RxJS 7.8, TypeScript 5.5 |
| Backend | Node.js 22, Fastify v4 (CommonJS), Sequelize v6, MySQL2 v3 |
| Auth | jsonwebtoken (JWT), bcrypt |
| Database | MySQL 8 |
| Infrastructure | Docker, Docker Compose, GitHub Actions |
| Package Manager | npm |

---

## 📁 プロジェクト構成

```
nodejs-app/
├── frontend/                 # Angular 18 SPA
│   └── src/app/
│       ├── components/       # 共有UIコンポーネント
│       ├── services/         # API通信・ビジネスロジック
│       ├── auth.guard.ts     # ルートガード
│       ├── auth.interceptor.ts  # JWT自動付与
│       └── app.routes.ts     # ルーティング
├── backend/                  # Fastify API
│   ├── app.js                # エントリーポイント
│   ├── plugins/              # Fastifyプラグイン
│   ├── routes/               # ルート定義
│   ├── controllers/          # コントローラー
│   ├── services/             # ビジネスロジック
│   ├── models/               # Sequelizeモデル
│   ├── migrations/           # DBマイグレーション
│   └── utils/                # ユーティリティ
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── docker-compose.yml
```

---

## ⚡ コマンドリファレンス

```bash
# 開発環境
docker compose up -d
docker compose down

# Backend
docker compose run --rm backend npm run test
docker compose run --rm backend npm install <pkg>
docker compose run --rm backend npx sequelize-cli migration:generate --name <name>
docker compose run --rm backend npx sequelize-cli db:migrate
docker compose run --rm backend npx sequelize-cli db:migrate:undo

# Frontend
docker compose run --rm frontend npm install <pkg>
docker compose run --rm frontend ng generate component <name>
docker compose run --rm frontend ng test --watch=false
docker compose run --rm frontend ng build
```

---

## 📋 アーキテクチャ方針

### Backend
- **CommonJS 必須**（`require` / `module.exports`、ESM 禁止）
- Fastify **JSON Schema バリデーション**をすべてのルートに付与
- ビジネスロジックは `services/` に集約、Controller は薄く保つ
- DB アクセスは Sequelize ORM 経由（生 SQL 禁止）
- JWT 認証は `preHandler` フックで一元管理

### Frontend
- `standalone: true` コンポーネントを推奨
- HTTP 通信は `services/` に集約（コンポーネントに直接書かない）
- RxJS の `subscribe` は `ngOnDestroy` で必ずアンサブスクライブ
- `any` 型の使用禁止（Interface / Type を定義する）

### 共通
- Feature-Based Module 構成（機能単位でディレクトリを分割）
- `.env` は絶対にコミットしない
- OWASP Top 10 を意識した実装

---

## 📌 現在の技術的負債・注意事項

- backend は CommonJS のため、ESM 構文（`import/export`）は使用不可
- Sequelize v6（最新は v7）のため、一部 API が旧式
- テストカバレッジが低い領域がある可能性 → 新規実装時はテストを必ず追加

---

## 🔗 関連ファイル

- `AI_MASTER_SPEC.md` — マスター仕様（最優先）
- `REVIEW.md` — レビュー指摘事項（存在する場合は必ず確認）
- `CLAUDE.md` — Claude Code 専用ガイド
- `.cursor/rules/` — Cursor 専用ルール
- `.github/copilot-instructions.md` — Copilot 専用ルール
- `GEMINI.md` — Gemini CLI 専用ガイド
- `.kiro/steering/` — Kiro 専用ガイド
