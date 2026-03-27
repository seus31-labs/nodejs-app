# Node.js App

Node.js (Fastify) + Angular による Todo 管理アプリです。

## 開発環境

本プロジェクトのビルド・テストは Docker コンテナ内で実行します。

```bash
docker compose up -d
```

## 初回セットアップ

```bash
docker compose run --rm backend npx sequelize-cli db:migrate
```

## 主な検証コマンド

### Backend

```bash
docker compose run --rm backend npm run test
```

### Frontend

```bash
docker compose run --rm frontend ng test --watch=false --browsers=ChromeHeadlessNoSandbox
docker compose run --rm frontend ng build
```

## ドキュメント

- Todo 基本機能設計: `docs/TODO_FEATURE_DESIGN.md`
- E2E 動作確認レポート: `docs/E2E_CHECK_2026-03-27.md`
- 機能別タスク一覧: `docs/TODO_TASKS_SUMMARY.md`