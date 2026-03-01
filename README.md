# Node.js App
Node.js + Angular App

## Todo 機能

ログイン済みユーザーが自分の Todo を CRUD できる機能です。詳細は `docs/TODO_FEATURE_DESIGN.md` を参照してください。

### 初回セットアップ（Todo 用テーブル）

```bash
docker compose run --rm backend npx sequelize-cli db:migrate
```

※ `DATABASE_URL` 等の環境変数が設定された状態で実行してください。