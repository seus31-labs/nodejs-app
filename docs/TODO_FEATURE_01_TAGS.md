# 機能1: タグ機能

---

## 📋 概要

Todo に複数のタグを付与し、タグでフィルタリング・検索できる機能。

---

## 🗄️ データモデル

### 新規テーブル: tags

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | タグ ID |
| userId | INT | FK (users.id), NOT NULL | 所有ユーザー ID |
| name | VARCHAR(50) | NOT NULL | タグ名 |
| color | VARCHAR(7) | DEFAULT '#808080' | タグ色（HEX） |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

### 新規テーブル: todo_tags（中間テーブル）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | ID |
| todoId | INT | FK (todos.id), NOT NULL | Todo ID |
| tagId | INT | FK (tags.id), NOT NULL | タグ ID |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |

### インデックス

- tags: `userId`, `UNIQUE(userId, name)`
- todo_tags: `todoId`, `tagId`, `UNIQUE(todoId, tagId)`

### 外部キー制約

- tags.userId → users.id (ON DELETE CASCADE)
- todo_tags.todoId → todos.id (ON DELETE CASCADE)
- todo_tags.tagId → tags.id (ON DELETE CASCADE)

---

## 🔌 API エンドポイント

### タグ管理

```
POST /api/tags
GET /api/tags
GET /api/tags/:id
PUT /api/tags/:id
DELETE /api/tags/:id
```

### Todo へのタグ付与

```
POST /api/todos/:todoId/tags
DELETE /api/todos/:todoId/tags/:tagId
GET /api/todos?tags=1,2,3  # タグでフィルタ
```

---

## ✅ Backend 実装タスク

### Task 1.1: Tag モデル作成

- [x] 1.1.1: マイグレーション生成 `create-tags`
- [x] 1.1.2: tags テーブル定義（id, userId, name, color, timestamps）
- [x] 1.1.3: インデックス追加（userId, UNIQUE(userId, name)）
- [x] 1.1.4: 外部キー制約追加（userId → users.id）
- [x] 1.1.5: `backend/models/Tag.js` 作成
- [x] 1.1.6: Tag モデル定義（バリデーション: name 必須、color HEX 形式）
- [x] 1.1.7: User との関連付け（belongsTo）

### Task 1.2: TodoTag 中間テーブル作成

- [x] 1.2.1: マイグレーション生成 `create-todo-tags`
- [x] 1.2.2: todo_tags テーブル定義（id, todoId, tagId, createdAt）
- [x] 1.2.3: インデックス追加（todoId, tagId, UNIQUE(todoId, tagId)）
- [x] 1.2.4: 外部キー制約追加（todoId, tagId）
- [x] 1.2.5: `backend/models/TodoTag.js` 作成
- [x] 1.2.6: TodoTag モデル定義

### Task 1.3: モデル関連付け更新

- [x] 1.3.1: Todo モデルに `belongsToMany(Tag, through: TodoTag)` 追加
- [x] 1.3.2: Tag モデルに `belongsToMany(Todo, through: TodoTag)` 追加
- [x] 1.3.3: User モデルに `hasMany(Tag)` 追加

### Task 1.4: TagService 作成

- [x] 1.4.1: `backend/services/TagService.js` 作成
- [x] 1.4.2: `createTag(userId, {name, color})` 実装
- [x] 1.4.3: `getTagsByUserId(userId)` 実装
- [x] 1.4.4: `getTagById(tagId, userId)` 実装
- [x] 1.4.5: `updateTag(tagId, userId, {name, color})` 実装
- [x] 1.4.6: `deleteTag(tagId, userId)` 実装（使用中チェック）
- [x] 1.4.7: 重複チェック処理実装

### Task 1.5: TodoService にタグ機能追加

- [x] 1.5.1: `addTagToTodo(todoId, tagId, userId)` 実装
- [x] 1.5.2: `removeTagFromTodo(todoId, tagId, userId)` 実装
- [x] 1.5.3: `getTodosByUserId` にタグフィルタ追加
- [x] 1.5.4: Todo 取得時にタグを include

### Task 1.6: TagController 作成

- [x] 1.6.1: `backend/controllers/TagController.js` 作成
- [x] 1.6.2: `createTag` ハンドラ実装
- [x] 1.6.3: `getTags` ハンドラ実装
- [x] 1.6.4: `getTagById` ハンドラ実装
- [x] 1.6.5: `updateTag` ハンドラ実装
- [x] 1.6.6: `deleteTag` ハンドラ実装
- [x] 1.6.7: エラーハンドリング（409 Conflict for duplicate）

### Task 1.7: TodoController にタグ機能追加

- [x] 1.7.1: `addTagToTodo` ハンドラ実装
- [x] 1.7.2: `removeTagFromTodo` ハンドラ実装

### Task 1.8: Tag ルート作成

- [x] 1.8.1: `backend/routes/api/tags.js` 作成
- [x] 1.8.2: POST /api/tags の JSON Schema 定義
- [x] 1.8.3: GET /api/tags のルート定義
- [x] 1.8.4: GET /api/tags/:id のルート定義
- [x] 1.8.5: PUT /api/tags/:id の JSON Schema 定義
- [x] 1.8.6: DELETE /api/tags/:id のルート定義
- [x] 1.8.7: JWT 認証 preHandler 適用

### Task 1.9: Todo ルートにタグエンドポイント追加

- [x] 1.9.1: POST /api/todos/:todoId/tags の JSON Schema 定義
- [x] 1.9.2: DELETE /api/todos/:todoId/tags/:tagId のルート定義
- [x] 1.9.3: GET /api/todos のクエリパラメータに tags 追加

### Task 1.10: マイグレーション実行

- [x] 1.10.1: `docker compose run --rm backend npx sequelize-cli db:migrate`

### Task 1.11: Backend テスト

- [x] 1.11.1: `backend/test/services/TagService.test.js` 作成
- [x] 1.11.2: TagService 各メソッドのテスト実装
- [x] 1.11.3: `backend/test/routes/tags.test.js` 作成
- [x] 1.11.4: Tag API 各エンドポイントのテスト実装
- [x] 1.11.5: Todo-Tag 関連 API のテスト実装

---

## ✅ Frontend 実装タスク

### Task 1.12: Tag インターフェース定義

- [x] 1.12.1: `frontend/src/app/models/tag.interface.ts` 作成
- [x] 1.12.2: Tag インターフェース定義
- [x] 1.12.3: CreateTagDto インターフェース定義
- [x] 1.12.4: UpdateTagDto インターフェース定義

### Task 1.13: Todo インターフェース更新

- [x] 1.13.1: Todo インターフェースに `tags: Tag[]` 追加

### Task 1.14: TagService 作成

- [x] 1.14.1: `frontend/src/app/services/tag.service.ts` 作成
- [x] 1.14.2: `createTag(tag: CreateTagDto): Observable<Tag>` 実装
- [x] 1.14.3: `getTags(): Observable<Tag[]>` 実装
- [x] 1.14.4: `getTagById(id: number): Observable<Tag>` 実装
- [x] 1.14.5: `updateTag(id: number, tag: UpdateTagDto): Observable<Tag>` 実装
- [x] 1.14.6: `deleteTag(id: number): Observable<void>` 実装
- [x] 1.14.7: エラーハンドリング実装

### Task 1.15: TodoService にタグ機能追加

- [x] 1.15.1: `addTagToTodo(todoId: number, tagId: number): Observable<void>` 実装
- [x] 1.15.2: `removeTagFromTodo(todoId: number, tagId: number): Observable<void>` 実装
- [x] 1.15.3: `getTodos` にタグフィルタパラメータ追加

### Task 1.16: TagList コンポーネント作成

- [x] 1.16.1: `ng generate component components/tag-list` 実行
- [x] 1.16.2: タグ一覧表示実装
- [x] 1.16.3: タグ作成ボタン実装
- [x] 1.16.4: タグ編集ボタン実装
- [x] 1.16.5: タグ削除ボタン実装（確認ダイアログ）
- [x] 1.16.6: タグ色のプレビュー表示

### Task 1.17: TagForm コンポーネント作成

- [x] 1.17.1: `ng generate component components/tag-form` 実装
- [x] 1.17.2: Reactive Forms 実装（name, color）
- [x] 1.17.3: カラーピッカー実装（input type="color"）
- [x] 1.17.4: バリデーション実装（name 必須、50文字以内）
- [x] 1.17.5: 作成/編集モード切り替え
- [x] 1.17.6: @Input() tag?: Tag 実装
- [x] 1.17.7: @Output() submitted 実装

### Task 1.18: TagChip コンポーネント作成

- [x] 1.18.1: `ng generate component components/tag-chip` 実行
- [x] 1.18.2: タグをチップ形式で表示
- [x] 1.18.3: タグ色を背景色に適用
- [x] 1.18.4: 削除ボタン実装（オプション）
- [x] 1.18.5: @Input() tag: Tag 実装
- [x] 1.18.6: @Input() removable: boolean 実装
- [x] 1.18.7: @Output() removed 実装

### Task 1.19: TodoItem にタグ表示追加

- [x] 1.19.1: TodoItem コンポーネントにタグ表示領域追加
- [x] 1.19.2: TagChip コンポーネント使用
- [x] 1.19.3: タグ削除機能実装

### Task 1.20: TodoForm にタグ選択追加

- [x] 1.20.1: TodoForm にタグ選択 UI 追加
- [x] 1.20.2: Angular Material Autocomplete 使用
- [x] 1.20.3: 選択済みタグをチップ表示
- [x] 1.20.4: タグ追加/削除機能実装
- [x] 1.20.5: フォーム送信時にタグ ID 配列を含める

### Task 1.21: TodoList にタグフィルタ追加

- [x] 1.21.1: タグフィルタ UI 追加
- [x] 1.21.2: 複数タグ選択可能に
- [x] 1.21.3: フィルタ適用時に API 呼び出し
- [x] 1.21.4: 選択中のタグをチップ表示

### Task 1.22: TagManagementPage 作成

- [x] 1.22.1: `ng generate component pages/tag-management-page` 実行
- [x] 1.22.2: TagList と TagForm を統合
- [x] 1.22.3: TagService 呼び出し実装
- [x] 1.22.4: RxJS takeUntil パターン実装
- [x] 1.22.5: ローディング・エラー状態管理

### Task 1.23: ルーティング追加

- [x] 1.23.1: `app.routes.ts` にタグ管理ページルート追加
- [x] 1.23.2: AuthGuard 適用

### Task 1.24: ナビゲーション更新

- [x] 1.24.1: メインナビゲーションに「タグ管理」リンク追加

### Task 1.25: スタイリング

- [x] 1.25.1: タグチップのスタイル実装
- [x] 1.25.2: タグ色に応じた文字色自動調整（明度計算）
- [x] 1.25.3: レスポンシブ対応

### Task 1.26: Frontend テスト

- [x] 1.26.1: TagService ユニットテスト
- [x] 1.26.2: TagList コンポーネントテスト
- [x] 1.26.3: TagForm コンポーネントテスト
- [x] 1.26.4: TagChip コンポーネントテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- 次の機能への影響: 検索機能（タグ名での検索）、統計機能（タグ別集計）
