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

```
POST /api/todos/:todoId/comments
GET /api/todos/:todoId/comments
PUT /api/comments/:id
DELETE /api/comments/:id
```

---

## ✅ Backend 実装タスク

### Task 9.1: Comment モデル作成
- [ ] 9.1.1: マイグレーション生成 `create-comments`
- [ ] 9.1.2: comments テーブル定義
- [ ] 9.1.3: インデックス追加（todoId, userId）
- [ ] 9.1.4: 外部キー制約追加
- [ ] 9.1.5: `backend/models/Comment.js` 作成
- [ ] 9.1.6: Comment モデル定義
- [ ] 9.1.7: Todo, User との関連付け
- [ ] 9.1.8: マイグレーション実行

### Task 9.2: CommentService 作成
- [ ] 9.2.1: `backend/services/CommentService.js` 作成
- [ ] 9.2.2: `createComment(todoId, userId, content)` 実装
- [ ] 9.2.3: `getCommentsByTodoId(todoId, userId)` 実装
- [ ] 9.2.4: `updateComment(commentId, userId, content)` 実装
- [ ] 9.2.5: `deleteComment(commentId, userId)` 実装

### Task 9.3: CommentController 作成
- [ ] 9.3.1: `backend/controllers/CommentController.js` 作成
- [ ] 9.3.2: 各ハンドラ実装
- [ ] 9.3.3: エラーハンドリング

### Task 9.4: Comment ルート作成
- [ ] 9.4.1: `backend/routes/api/comments.js` 作成
- [ ] 9.4.2: 各エンドポイントの JSON Schema 定義
- [ ] 9.4.3: JWT 認証 preHandler 適用

### Task 9.5: Backend テスト
- [ ] 9.5.1: CommentService のテスト
- [ ] 9.5.2: Comment API のテスト

---

## ✅ Frontend 実装タスク

### Task 9.6: Comment インターフェース定義
- [ ] 9.6.1: `frontend/src/app/models/comment.interface.ts` 作成
- [ ] 9.6.2: Comment, CreateCommentDto, UpdateCommentDto 定義

### Task 9.7: CommentService 作成
- [ ] 9.7.1: `frontend/src/app/services/comment.service.ts` 作成
- [ ] 9.7.2: CRUD メソッド実装

### Task 9.8: CommentList コンポーネント作成
- [ ] 9.8.1: `ng generate component components/comment-list` 実行
- [ ] 9.8.2: コメント一覧をタイムライン形式で表示
- [ ] 9.8.3: 編集・削除ボタン実装
- [ ] 9.8.4: @Input() todoId: number 実装

### Task 9.9: CommentForm コンポーネント作成
- [ ] 9.9.1: `ng generate component components/comment-form` 実装
- [ ] 9.9.2: テキストエリア実装
- [ ] 9.9.3: 送信ボタン実装
- [ ] 9.9.4: @Output() submitted 実装

### Task 9.10: TodoDetail にコメント機能追加
- [ ] 9.10.1: CommentList コンポーネント追加
- [ ] 9.10.2: CommentForm コンポーネント追加

### Task 9.11: スタイリング
- [ ] 9.11.1: タイムラインのスタイル
- [ ] 9.11.2: コメントバブルのスタイル

### Task 9.12: Frontend テスト
- [ ] 9.12.1: CommentService のテスト
- [ ] 9.12.2: 各コンポーネントのテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
