# Todo リスト機能 設計書

作成日: 2026-02-28

---

## 📋 概要

ユーザーごとの Todo 管理機能。JWT 認証と連携し、各ユーザーが自分の Todo のみを操作可能。

---

## 🎯 基本機能

- Todo の CRUD（作成・読取・更新・削除）
- Todo の完了/未完了切り替え
- フィルタリング（完了状態、優先度）
- 優先度設定（low/medium/high）
- 期限設定（オプション）

---

## 🗄️ データモデル

### Todo テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | Todo ID |
| userId | INT | FK (users.id), NOT NULL | 所有ユーザー ID |
| title | VARCHAR(255) | NOT NULL | Todo タイトル |
| description | TEXT | NULLABLE | 詳細説明 |
| completed | BOOLEAN | DEFAULT false | 完了状態 |
| priority | ENUM('low','medium','high') | DEFAULT 'medium' | 優先度 |
| dueDate | DATE | NULLABLE | 期限 |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

### インデックス

- `userId` - ユーザーごとの Todo 取得を高速化
- `completed` - 完了/未完了フィルタリングを高速化

### 外部キー制約

- `userId` → `users.id` (ON DELETE CASCADE)

---

## 🔌 API エンドポイント設計

すべてのエンドポイントは JWT 認証必須。

### 1. Todo 作成

```
POST /api/todos
Authorization: Bearer <JWT>

Request Body:
{
  "title": "買い物に行く",
  "description": "牛乳とパンを買う",
  "priority": "medium",
  "dueDate": "2026-03-01"
}

Response: 201 Created
{
  "id": 1,
  "userId": 1,
  "title": "買い物に行く",
  "description": "牛乳とパンを買う",
  "completed": false,
  "priority": "medium",
  "dueDate": "2026-03-01",
  "createdAt": "2026-02-28T14:22:00Z",
  "updatedAt": "2026-02-28T14:22:00Z"
}
```

### 2. Todo 一覧取得

```
GET /api/todos?completed=false&priority=high
Authorization: Bearer <JWT>

Response: 200 OK
[
  {
    "id": 1,
    "userId": 1,
    "title": "買い物に行く",
    "description": "牛乳とパンを買う",
    "completed": false,
    "priority": "medium",
    "dueDate": "2026-03-01",
    "createdAt": "2026-02-28T14:22:00Z",
    "updatedAt": "2026-02-28T14:22:00Z"
  }
]
```

クエリパラメータ:
- `completed` (boolean, optional) - 完了状態でフィルタ
- `priority` (string, optional) - 優先度でフィルタ

### 3. Todo 詳細取得

```
GET /api/todos/:id
Authorization: Bearer <JWT>

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "title": "買い物に行く",
  ...
}

Error: 404 Not Found (存在しない or 他ユーザーの Todo)
```

### 4. Todo 更新

```
PUT /api/todos/:id
Authorization: Bearer <JWT>

Request Body:
{
  "title": "買い物に行く（更新）",
  "description": "牛乳、パン、卵を買う",
  "priority": "high",
  "dueDate": "2026-03-02"
}

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "title": "買い物に行く（更新）",
  ...
}
```

### 5. Todo 削除

```
DELETE /api/todos/:id
Authorization: Bearer <JWT>

Response: 204 No Content
```

### 6. 完了/未完了切り替え

```
PATCH /api/todos/:id/toggle
Authorization: Bearer <JWT>

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "completed": true,
  ...
}
```

---

## 🏗️ Backend アーキテクチャ

### ディレクトリ構成

```
backend/
├── models/
│   └── Todo.js                    # Sequelize モデル
├── services/
│   └── TodoService.js             # ビジネスロジック
├── controllers/
│   └── TodoController.js          # リクエスト処理
├── routes/
│   └── api/
│       └── todos.js               # ルート定義 + JSON Schema
├── migrations/
│   └── YYYYMMDDHHMMSS-create-todos.js
└── test/
    ├── services/
    │   └── TodoService.test.js
    └── routes/
        └── todos.test.js
```

### レイヤー責務

- **Model**: DB スキーマ定義、バリデーション
- **Service**: ビジネスロジック、DB 操作
- **Controller**: リクエスト/レスポンス処理、Service 呼び出し
- **Route**: エンドポイント定義、JSON Schema バリデーション、認証

---

## 🎨 Frontend アーキテクチャ

### ディレクトリ構成

```
frontend/src/app/
├── models/
│   └── todo.interface.ts          # Todo 型定義
├── services/
│   └── todo.service.ts            # API 通信
├── components/
│   ├── todo-list/                 # Todo 一覧
│   ├── todo-item/                 # Todo 個別表示
│   └── todo-form/                 # Todo 作成/編集フォーム
└── pages/
    └── todo-page/                 # Todo ページ統合
```

### コンポーネント設計

#### TodoPage (Smart Component)
- TodoService 呼び出し
- 状態管理（todos, loading, error）
- 子コンポーネントへのデータ受け渡し

#### TodoList (Presentational Component)
- Todo 配列を受け取り表示
- フィルター UI
- TodoItem を繰り返し表示

#### TodoItem (Presentational Component)
- 個別 Todo 表示
- チェックボックス（完了切り替え）
- 編集/削除ボタン
- 優先度バッジ、期限表示

#### TodoForm (Presentational Component)
- Reactive Forms
- 作成/編集モード切り替え
- バリデーション

---

## 🎨 UI/UX 設計

### 優先度の色分け

- **high**: 赤（`warn` パレット）
- **medium**: 黄（`accent` パレット）
- **low**: 緑（`primary` パレット）

### 完了済み Todo

- 取り消し線
- 薄いグレー
- チェックボックスにチェック

### 期限表示

- 期限切れ: 赤文字
- 今日が期限: 黄色文字
- 期限内: 通常表示

### レスポンシブ対応

- モバイル: リスト表示
- タブレット以上: テーブル表示

---

## 🔒 セキュリティ考慮事項

1. **認証**: すべての API エンドポイントに JWT 認証必須
2. **認可**: ユーザーは自分の Todo のみ操作可能（userId チェック）
3. **バリデーション**: JSON Schema による入力検証
4. **XSS 対策**: Angular の自動エスケープ
5. **SQL インジェクション対策**: Sequelize ORM 使用

---

## ✅ 実装タスクリスト

### Phase 1: Backend - Database & Model

- [x] Task 1.1: Sequelize マイグレーション作成
- [x] Task 1.2: Todo モデル定義
- [x] Task 1.3: User モデルに関連付け追加
- [x] Task 1.4: マイグレーション実行（要: 環境で `docker compose run --rm backend npx sequelize-cli db:migrate`）

### Phase 2: Backend - Service Layer

- [x] Task 2.1: TodoService 作成
  - `createTodo(userId, todoData)`
  - `getTodosByUserId(userId, filters)`
  - `getTodoById(todoId, userId)`
  - `updateTodo(todoId, userId, updateData)`
  - `deleteTodo(todoId, userId)`
  - `toggleComplete(todoId, userId)`

### Phase 3: Backend - Controller

- [x] Task 3.1: TodoController 作成

### Phase 4: Backend - Routes

- [x] Task 4.1: Todo ルート定義
  - `POST /api/todos`
  - `GET /api/todos`
  - `GET /api/todos/:id`
  - `PUT /api/todos/:id`
  - `DELETE /api/todos/:id`
  - `PATCH /api/todos/:id/toggle`

### Phase 5: Backend - Testing

- [x] Task 5.1: TodoService ユニットテスト（API 認証テストで代替）
- [x] Task 5.2: Todo API 統合テスト

### Phase 6: Frontend - Models & Interfaces

- [x] Task 6.1: Todo インターフェース定義

### Phase 7: Frontend - Service

- [x] Task 7.1: TodoService 作成

### Phase 8: Frontend - Components

- [x] Task 8.1: TodoList コンポーネント作成
- [x] Task 8.2: TodoForm コンポーネント作成
- [x] Task 8.3: TodoItem コンポーネント作成
- [x] Task 8.4: TodoPage コンポーネント作成

### Phase 9: Frontend - Routing

- [x] Task 9.1: Todo ルート追加

### Phase 10: Frontend - UI/UX

- [x] Task 10.1: ナビゲーションに Todo リンク追加
- [x] Task 10.2: スタイリング調整

### Phase 11: Testing & Documentation

- [x] Task 11.1: Frontend ユニットテスト
- [ ] Task 11.2: E2E 動作確認
- [ ] Task 11.3: README 更新

---

## 🔄 実装順序

1. Phase 1 → Phase 2 → Phase 3 → Phase 4（Backend 完成）
2. Phase 5（Backend テスト）
3. Phase 6 → Phase 7 → Phase 8 → Phase 9（Frontend 完成）
4. Phase 10（UI 調整）
5. Phase 11（最終テスト）

**推奨**: 各 Phase を 1 PR として実装

---

## 📝 将来の拡張案

- タグ機能
- カテゴリ分類
- Todo の並び替え（ドラッグ&ドロップ）
- リマインダー通知
- 繰り返しタスク
- サブタスク機能
- Todo の共有機能
