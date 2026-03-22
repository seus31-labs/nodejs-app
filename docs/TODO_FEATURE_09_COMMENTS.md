# 機能9: コメント機能

---

## 📋 概要

Todo にメモ・コメントを追加し、タイムライン形式で表示。

---

## 🗄️ データモデル

### 新規テーブル: comments

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | コメント ID |
| todoId | INT | FK (todos.id), NOT NULL | Todo ID |
| userId | INT | FK (users.id), NOT NULL | コメント作成者 ID |
| content | TEXT | NOT NULL | コメント内容 |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

---

## 🔌 API エンドポイント

実装は `/api/v1` プレフィックス（他 API と同様）。

```
POST   /api/v1/todos/:todoId/comments
GET    /api/v1/todos/:todoId/comments
PUT    /api/v1/comments/:id
DELETE /api/v1/comments/:id
```

---

## ✅ Backend 実装タスク

### Task 9.1: Comment モデル作成
- [x] 9.1.1: マイグレーション生成 `create-comments`
- [x] 9.1.2: comments テーブル定義
- [x] 9.1.3: インデックス追加（todoId, userId）
- [x] 9.1.4: 外部キー制約追加
- [x] 9.1.5: `backend/models/comment.js` 作成
- [x] 9.1.6: Comment モデル定義
- [x] 9.1.7: Todo, User との関連付け
- [x] 9.1.8: マイグレーション実行

### Task 9.2: CommentService 作成
- [x] 9.2.1: `backend/services/commentService.js` 作成
- [x] 9.2.2: `createComment(todoId, userId, content)` 実装
- [x] 9.2.3: `getCommentsByTodoId(todoId, userId)` 実装
- [x] 9.2.4: `updateComment(commentId, userId, content)` 実装
- [x] 9.2.5: `deleteComment(commentId, userId)` 実装

### Task 9.3: CommentController 作成
- [x] 9.3.1: `backend/controllers/commentController.js` 作成
- [x] 9.3.2: 各ハンドラ実装
- [x] 9.3.3: エラーハンドリング

### Task 9.4: Comment ルート作成
- [x] 9.4.1: `backend/routes/api/v1/index.js` にコメントルートを追加
- [x] 9.4.2: 各エンドポイントの JSON Schema 定義
- [x] 9.4.3: JWT 認証 preHandler 適用

### Task 9.5: Backend テスト
- [x] 9.5.1: CommentService のテスト（ルート結合テストで権限・CRUD をカバー）
- [x] 9.5.2: Comment API のテスト（`test/routes/comments.test.js`）

---

## ✅ Frontend 実装タスク

### Task 9.6: Comment インターフェース定義
- [x] 9.6.1: `frontend/src/app/models/comment.interface.ts` 作成
- [x] 9.6.2: Comment, CreateCommentDto, UpdateCommentDto 定義

### Task 9.7: CommentService 作成
- [x] 9.7.1: `frontend/src/app/services/comment.service.ts` 作成
- [x] 9.7.2: CRUD メソッド実装

### Task 9.8: CommentList コンポーネント作成
- [x] 9.8.1: `comment-list` コンポーネント（standalone）を `dashboard/todo/comment-list` に配置
- [x] 9.8.2: コメント一覧をタイムライン形式で表示
- [x] 9.8.3: 編集・削除ボタン実装（`isMine` 時）
- [x] 9.8.4: `@Input() comments` 実装（todoId は親セクションが保持）

### Task 9.9: CommentForm コンポーネント作成
- [x] 9.9.1: `comment-form` コンポーネント（standalone）を `dashboard/todo/comment-form` に配置
- [x] 9.9.2: テキストエリア実装
- [x] 9.9.3: 送信ボタン実装
- [x] 9.9.4: `@Output() submitted` 実装

### Task 9.10: Todo 詳細相当 UI にコメント機能追加
- [x] 9.10.1: `todo-comments-section` + `todo-item` に CommentList を組み込み
- [x] 9.10.2: 同上に CommentForm を組み込み（折りたたみで表示）

### Task 9.11: スタイリング
- [x] 9.11.1: タイムラインのスタイル
- [x] 9.11.2: コメントバブルのスタイル

### Task 9.12: Frontend テスト
- [x] 9.12.1: CommentService のテスト
- [x] 9.12.2: comment-form / comment-list のユニットテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
