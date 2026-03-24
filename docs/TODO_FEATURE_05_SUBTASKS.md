# 機能5: サブタスク機能

---

## 📋 概要

Todo の下に子タスクを作成し、親 Todo の進捗率を表示する機能。

---

## 🗄️ データモデル

### todos テーブルにカラム追加

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| parentId | INT | FK (todos.id), NULLABLE | 親 Todo ID |

### インデックス追加

- todos: `parentId`

### 外部キー制約

- todos.parentId → todos.id (ON DELETE CASCADE)

---

## 🔌 API エンドポイント

```
GET /api/todos/:id/subtasks
POST /api/todos/:id/subtasks
GET /api/todos/:id/progress
```

---

## ✅ Backend 実装タスク

### Task 5.1: parentId カラム追加

- [x] 5.1.1: マイグレーション生成 `add-parent-id-to-todos`
- [x] 5.1.2: parentId カラム追加
- [x] 5.1.3: インデックス追加
- [x] 5.1.4: 外部キー制約追加（自己参照）
- [x] 5.1.5: マイグレーション実行

### Task 5.2: Todo モデル更新

- [x] 5.2.1: parentId フィールド追加
- [x] 5.2.2: 自己関連付け定義（hasMany, belongsTo）
- [x] 5.2.3: バリデーション（循環参照チェック）

### Task 5.3: TodoService にサブタスク機能追加

- [x] 5.3.1: `getSubtasks(todoId, userId)` 実装
- [x] 5.3.2: `createSubtask(parentId, userId, todoData)` 実装
- [x] 5.3.3: `getProgress(todoId, userId)` 実装（完了率計算）
- [x] 5.3.4: `getTodosByUserId` でサブタスクを除外（parentId IS NULL）
- [x] 5.3.5: 循環参照チェック処理実装

### Task 5.4: TodoController にサブタスク機能追加

- [x] 5.4.1: `getSubtasks` ハンドラ実装
- [x] 5.4.2: `createSubtask` ハンドラ実装
- [ ] 5.4.3: `getProgress` ハンドラ実装

### Task 5.5: Todo ルート更新

- [ ] 5.5.1: GET /api/todos/:id/subtasks のルート定義
- [ ] 5.5.2: POST /api/todos/:id/subtasks のルート定義
- [ ] 5.5.3: GET /api/todos/:id/progress のルート定義
- [ ] 5.5.4: JSON Schema 定義

### Task 5.6: Backend テスト

- [ ] 5.6.1: TodoService サブタスク機能のテスト
- [ ] 5.6.2: 循環参照チェックのテスト
- [ ] 5.6.3: 進捗率計算のテスト
- [ ] 5.6.4: サブタスク API のテスト

---

## ✅ Frontend 実装タスク

### Task 5.7: Todo インターフェース更新

- [ ] 5.7.1: Todo インターフェースに parentId, subtasks, progress 追加

### Task 5.8: TodoService にサブタスク機能追加

- [ ] 5.8.1: `getSubtasks(todoId: number): Observable<Todo[]>` 実装
- [ ] 5.8.2: `createSubtask(parentId: number, todo: CreateTodoDto): Observable<Todo>` 実装
- [ ] 5.8.3: `getProgress(todoId: number): Observable<{completed: number, total: number}>` 実装

### Task 5.9: SubtaskList コンポーネント作成

- [ ] 5.9.1: `ng generate component components/subtask-list` 実行
- [ ] 5.9.2: サブタスク一覧表示実装
- [ ] 5.9.3: サブタスク追加ボタン実装
- [ ] 5.9.4: @Input() parentId: number 実装
- [ ] 5.9.5: インデント表示実装

### Task 5.10: ProgressBar コンポーネント作成

- [ ] 5.10.1: `ng generate component components/progress-bar` 実行
- [ ] 5.10.2: Angular Material Progress Bar 使用
- [ ] 5.10.3: 進捗率表示実装
- [ ] 5.10.4: @Input() progress: {completed: number, total: number} 実装

### Task 5.11: TodoItem に進捗バー追加

- [ ] 5.11.1: サブタスクがある場合に進捗バー表示
- [ ] 5.11.2: サブタスク展開/折りたたみボタン実装
- [ ] 5.11.3: 展開時に SubtaskList 表示

### Task 5.12: TodoForm にサブタスク作成モード追加

- [ ] 5.12.1: @Input() parentId?: number 追加
- [ ] 5.12.2: サブタスク作成時の UI 調整

### Task 5.13: TodoDetail ページ作成

- [ ] 5.13.1: `ng generate component pages/todo-detail-page` 実行
- [ ] 5.13.2: Todo 詳細表示実装
- [ ] 5.13.3: SubtaskList 統合
- [ ] 5.13.4: ルーティング追加

### Task 5.14: スタイリング

- [ ] 5.14.1: サブタスクのインデント表示
- [ ] 5.14.2: 進捗バーのスタイル
- [ ] 5.14.3: 階層構造の視覚化

### Task 5.15: Frontend テスト

- [ ] 5.15.1: TodoService サブタスク機能のテスト
- [ ] 5.15.2: SubtaskList コンポーネントテスト
- [ ] 5.15.3: ProgressBar コンポーネントテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- 複雑度: 高（自己参照リレーション）
