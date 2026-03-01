# CLAUDE.md — Claude Code Project Guide

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
docker compose run --rm backend npm install
docker compose run --rm backend npm run test
docker compose run --rm backend node --test test/**/*.test.js
docker compose run --rm frontend npm install
docker compose run --rm frontend ng build
docker compose run --rm frontend ng test

# ❌ 禁止例
npm install        # ホストで実行禁止
ng build           # ホストで実行禁止
node app.js        # ホストで実行禁止
```

### 2. タスク実装フロー
1. `git checkout main && git pull origin main` で main を最新化
2. `git checkout -b feature/<task-name>` でブランチを作成
3. 実装 → commit → push
4. PR を作成してレビューを依頼
5. レビュー指摘は `REVIEW.md` を参照して修正
6. 修正後は必ず commit + push して再レビューを依頼

### 3. 実装姿勢
- **思考は英語で行い、出力（説明・コメント・PR文）は日本語で行う**
- パフォーマンス・メンテナンス性・安全性・ユーザービリティ・アルゴリズムを考慮する
- 不明な点は勝手に判断せず、必ず確認する

---

## 🏗️ 技術スタック

| 領域 | 技術 |
|------|------|
| Frontend | Angular 18, Angular Material 18, Bootstrap 5, ApexCharts, RxJS 7.8, TypeScript 5.5 |
| Backend | Node.js 22, Fastify v4 (CommonJS), Sequelize v6, MySQL2 |
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
├── frontend/                # Angular 18 SPA
│   └── src/app/
│       ├── components/      # 共有コンポーネント
│       ├── services/        # HTTP・ビジネスロジック
│       ├── auth.guard.ts    # ルートガード
│       ├── auth.interceptor.ts  # JWT インターセプター
│       └── app.routes.ts    # ルーティング定義
├── backend/                 # Fastify API サーバー
│   ├── app.js               # エントリーポイント
│   ├── plugins/             # Fastify プラグイン
│   ├── routes/              # ルート定義
│   ├── controllers/         # コントローラー
│   ├── services/            # ビジネスロジック
│   ├── models/              # Sequelize モデル
│   ├── migrations/          # DB マイグレーション
│   └── utils/               # ユーティリティ
├── docker/                  # Dockerfile
├── docker-compose.yml       # コンテナ定義
└── .env.local.*             # 環境変数（git 管理外）
```

---

## ⚡ よく使うコマンド

```bash
# 開発環境起動
docker compose up -d

# バックエンド操作
docker compose run --rm backend npm run test
docker compose run --rm backend npm run dev
docker compose run --rm backend npx sequelize-cli db:migrate

# フロントエンド操作
docker compose run --rm frontend ng build
docker compose run --rm frontend ng test --watch=false

# ログ確認
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 🧑‍💻 コーディング規約

### Backend (Node.js / Fastify)
- CommonJS (`require` / `module.exports`) を使用（ESM 不可）
- Fastify スキーマバリデーションを必ずルートに付与する
- Sequelize モデルは `models/` に集約し、直接 SQL を書かない
- JWT 検証は Fastify フック（`preHandler`）で行う
- エラーは `fastify.httpErrors` または `reply.code(xxx).send({...})` で返す
- 環境変数は `process.env.xxx` で参照し、必ず存在チェックを行う

### Frontend (Angular)
- `standalone: true` コンポーネントを推奨
- HTTP 通信は `services/` 内の Service に集約し、コンポーネントに直接書かない
- RxJS の `subscribe` は必ず `ngOnDestroy` でアンサブスクライブする
- 認証状態は `auth.interceptor.ts` / `auth.guard.ts` で一元管理する
- Angular Material + Bootstrap 5 を UI の主軸とし、独自 CSS は `scss/` に配置する
- TypeScript の型は `any` を使用せず、Interface または Type を定義する

### 共通
- 環境変数 (`.env`) は絶対にコミットしない
- OWASP Top 10 を意識した実装を行う
- JSDoc / コメントは「何をするか」より「**なぜこの実装か**」を重視する

---

## 🛡️ セキュリティチェックリスト

- [ ] 入力バリデーション（Fastify JSON Schema）
- [ ] JWT 有効期限・署名検証
- [ ] bcrypt によるパスワードハッシュ化
- [ ] CORS 設定（`.env` の `CORS_ORIGIN`）
- [ ] SQL インジェクション対策（Sequelize ORM 使用）
- [ ] `.env` の `.gitignore` 登録確認
