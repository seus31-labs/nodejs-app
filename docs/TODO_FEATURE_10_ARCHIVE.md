# 機能10: アーカイブ機能

---

## 📋 概要

完了した Todo を削除せずアーカイブし、別画面で管理。

---

## 🗄️ データモデル

### todos テーブルにカラム追加

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| archived | BOOLEAN | DEFAULT false | アーカイブ済みか |
| archivedAt | TIMESTAMP | NULLABLE | アーカイブ日時 |

---

## 🔌 API エンドポイント

```
PATCH /api/todos/:id/archive
PATCH /api/todos/:id/unarchive
GET /api/todos/archived
DELETE /api/todos/archived (一括削除)
```

---

## ✅ Backend 実装タスク

### Task 10.1: archived カラム追加
- [x] 10.1.1: マイグレーション生成 `add-archived-to-todos`
- [x] 10.1.2: archived, archivedAt カラム追加
- [x] 10.1.3: インデックス追加（archived）
- [x] 10.1.4: マイグレーション実行

### Task 10.2: Todo モデル更新
- [x] 10.2.1: archived, archivedAt フィールド追加

### Task 10.3: TodoService にアーカイブ機能追加
- [x] 10.3.1: `archiveTodo(todoId, userId)` 実装
- [x] 10.3.2: `unarchiveTodo(todoId, userId)` 実装
- [x] 10.3.3: `getArchivedTodos(userId)` 実装
- [x] 10.3.4: `deleteArchivedTodos(userId)` 実装
- [x] 10.3.5: `getTodosByUserId` でアーカイブ済みを除外

### Task 10.4: TodoController にアーカイブ機能追加
- [x] 10.4.1: `archiveTodo` ハンドラ実装
- [x] 10.4.2: `unarchiveTodo` ハンドラ実装
- [x] 10.4.3: `getArchivedTodos` ハンドラ実装
- [x] 10.4.4: `deleteArchivedTodos` ハンドラ実装

### Task 10.5: Todo ルート更新
- [x] 10.5.1: PATCH /api/todos/:id/archive のルート定義
- [x] 10.5.2: PATCH /api/todos/:id/unarchive のルート定義
- [x] 10.5.3: GET /api/todos/archived のルート定義
- [x] 10.5.4: DELETE /api/todos/archived のルート定義

### Task 10.6: Backend テスト
- [x] 10.6.1: TodoService アーカイブ機能のテスト
- [x] 10.6.2: アーカイブ API のテスト

---

## ✅ Frontend 実装タスク

### Task 10.7: TodoService にアーカイブ機能追加
- [x] 10.7.1: `archiveTodo(id: number): Observable<Todo>` 実装
- [x] 10.7.2: `unarchiveTodo(id: number): Observable<Todo>` 実装
- [x] 10.7.3: `getArchivedTodos(): Observable<Todo[]>` 実装
- [x] 10.7.4: `deleteArchivedTodos(): Observable<void>` 実装

### Task 10.8: TodoItem にアーカイブボタン追加
- [x] 10.8.1: 完了済み Todo にアーカイブボタン表示
- [x] 10.8.2: @Output() archived 実装

### Task 10.9: ArchivedTodosPage 作成
- [x] 10.9.1: `ng generate component pages/archived-todos-page` 実行
- [x] 10.9.2: アーカイブ済み Todo 一覧表示
- [x] 10.9.3: アーカイブ解除ボタン実装
- [x] 10.9.4: 一括削除ボタン実装（確認ダイアログ）
- [x] 10.9.5: ルーティング追加

### Task 10.10: ナビゲーション更新
- [x] 10.10.1: メインナビゲーションに「アーカイブ」リンク追加

### Task 10.11: スタイリング
- [x] 10.11.1: アーカイブ済み Todo のスタイル

### Task 10.12: Frontend テスト
- [x] 10.12.1: TodoService アーカイブ機能のテスト
- [x] 10.12.2: ArchivedTodosPage のテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- 複雑度: 低
