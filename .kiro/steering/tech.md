# Tech Stack & Development Rules

Source of Truth: `AI_MASTER_SPEC.md`

---

## 🎭 あなたの役割

あなたはインフラ・フロントエンド・バックエンド・セキュリティに精通した**シニアエンジニア**です。

---

## 🚨 最重要ルール（必須遵守）

### 環境汚染の防止

**ホストマシンで直接 `npm install` / `ng build` などを実行しない。**
すべてのビルド・依存追加・テストは Docker コンテナ内で実行する。

```bash
# ✅ 正しい例
docker compose run --rm backend npm install <package>
docker compose run --rm backend npm run test
docker compose run --rm backend npx sequelize-cli db:migrate
docker compose run --rm frontend npm install <package>
docker compose run --rm frontend ng build
docker compose run --rm frontend ng test --watch=false

# ❌ 禁止
npm install   # ホスト直接実行禁止
ng build      # ホスト直接実行禁止
```

### タスク実装フロー

1. `git checkout main && git pull origin main`
2. `git checkout -b feature/<task-name>`
3. 実装 → コミット → プッシュ
4. PR 作成 → レビュー依頼
5. `REVIEW.md` を参照して指摘修正 → コミット → プッシュ → 再レビュー依頼

> **1 タスク = 1 PR**

### 実装姿勢

- **思考は英語、出力・コメント・PR 文は日本語**
- パフォーマンス・メンテナンス性・安全性・ユーザービリティを常に考慮
- 不明点は勝手に判断せず、必ず確認する

---

## 技術スタック

| 領域 | 技術 | バージョン |
|------|------|----------|
| Frontend Framework | Angular | 18 |
| UI Library | Angular Material | 18 |
| CSS Framework | Bootstrap | 5.3 |
| Charts | ApexCharts + ng-apexcharts | 最新 |
| State / Async | RxJS | 7.8 |
| Language (FE) | TypeScript | 5.5 |
| Backend Framework | Fastify | v4 (CommonJS) |
| Runtime | Node.js | 22 (Alpine) |
| ORM | Sequelize | v6 |
| DB Driver | mysql2 | v3 |
| Database | MySQL | 8 |
| Auth | jsonwebtoken + bcrypt | 最新 |
| Infrastructure | Docker + Docker Compose | 最新 |
| CI/CD | GitHub Actions | - |
| Package Manager | npm | - |
| Test (FE) | Karma + Jasmine | - |
| Test (BE) | Node.js built-in test runner | - |

---

## コンテナサービス名

| サービス | コンテナ名 | ポート |
|---------|-----------|-------|
| frontend | frontend | env: EXPOSE_FRONTEND_PORT → 4200 |
| backend | backend | env: EXPOSE_BACKEND_PORT → 3000 |
| db | db (MySQL 8) | env: EXPOSE_DATABASE_PORT → 3306 |

---

## Backend 規約

- **CommonJS 必須**（`require` / `module.exports`）、ESM 禁止
- Fastify JSON Schema バリデーションをすべてのルートに付与
- ビジネスロジックは `services/` に集約、Controller を薄く保つ
- DB アクセスは Sequelize ORM 経由（生 SQL 禁止）
- JWT 認証は `preHandler` フックで一元管理
- bcrypt パスワードハッシュ化（cost >= 10）
- 早期リターン（ガード句）でネストを浅く保つ

## Frontend 規約

- `standalone: true` コンポーネントを推奨
- HTTP 通信は `services/` の Service に集約
- RxJS の `subscribe` は `takeUntil(destroy$)` パターン
- `any` 型の使用禁止（Interface / Type を定義）
- Angular Material 18 + Bootstrap 5 を UI 主軸とする

## 共通規約

- `.env` は絶対にコミットしない
- OWASP Top 10 準拠
- Feature-Based Module 構成
