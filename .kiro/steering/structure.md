# Project Structure

## ディレクトリ構成

```
nodejs-app/
├── AI_MASTER_SPEC.md          # ← マスター仕様（最優先の真実のソース）
├── AGENTS.md                  # 全 AI エージェント共通ガイド
├── CLAUDE.md                  # Claude Code 専用ガイド
├── GEMINI.md                  # Gemini CLI 専用ガイド
├── REVIEW.md                  # レビュー指摘事項（存在する場合は必ず確認）
├── README.md
├── docker-compose.yml
│
├── docker/
│   ├── Dockerfile.backend     # Node.js 22 Alpine
│   └── Dockerfile.frontend    # Node.js + Angular CLI
│
├── frontend/                  # Angular 18 SPA
│   ├── angular.json
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── app.component.ts
│       │   ├── app.config.ts
│       │   ├── app.routes.ts
│       │   ├── auth.guard.ts        # 認証ルートガード
│       │   ├── auth.interceptor.ts  # JWT自動付与インターセプター
│       │   ├── components/          # 共有UIコンポーネント
│       │   ├── services/            # API通信・ビジネスロジック
│       │   └── theme/               # テーマ設定
│       ├── environments/
│       ├── scss/                    # グローバルスタイル変数
│       └── styles.scss
│
├── backend/                   # Fastify REST API
│   ├── app.js                 # エントリーポイント（CORS, AutoLoad設定）
│   ├── .sequelizerc           # Sequelize CLI 設定
│   ├── package.json
│   ├── config/
│   │   └── database.js        # DB接続設定
│   ├── plugins/               # Fastify プラグイン（認証など）
│   ├── routes/                # ルート定義
│   │   ├── root.js
│   │   └── api/               # API ルート群
│   ├── controllers/           # リクエスト処理
│   ├── services/              # ビジネスロジック
│   ├── models/                # Sequelize モデル定義
│   ├── migrations/            # DB マイグレーション
│   ├── utils/                 # ユーティリティ関数
│   └── test/                  # テストファイル
│
├── .github/
│   ├── copilot-instructions.md  # GitHub Copilot 設定
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
│
├── .cursor/
│   └── rules/
│       ├── general.mdc        # 全ファイル共通ルール
│       ├── backend.mdc        # Backend 専用ルール
│       └── frontend.mdc       # Frontend 専用ルール
│
└── .kiro/
    └── steering/
        ├── product.md         # プロダクト概要
        ├── tech.md            # 技術スタック・開発ルール
        └── structure.md       # 本ファイル（ディレクトリ構成）
```

## 命名規則

| 種別 | 規則 | 例 |
|------|------|----|
| ブランチ名 | `feature/<task-name>` | `feature/user-auth` |
| Angular コンポーネント | ケバブケース | `user-profile.component.ts` |
| Angular サービス | ケバブケース + service | `auth.service.ts` |
| Fastify ルートファイル | ケバブケース | `users.js` |
| Sequelize モデル | パスカルケース | `User.js` |
| マイグレーション | タイムスタンプ + 説明 | `20240101000000-create-users.js` |
| 環境変数 | スネークケース大文字 | `JWT_SECRET` |

## 環境変数ファイル

```
.env                    # 共通（git 管理外）
.env.local.backend      # Backend 開発用（git 管理外）
.env.local.frontend     # Frontend 開発用（git 管理外）
.env.sample             # サンプル（git 管理）
.env.backend.sample     # Backend サンプル（git 管理）
.env.frontend.sample    # Frontend サンプル（git 管理）
```
