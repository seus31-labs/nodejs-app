# 機能6: 繰り返しタスク

---

## 📋 概要

毎日・毎週・毎月の繰り返し設定を持つ Todo。完了時に次回の Todo を自動生成。

---

## 🗄️ データモデル

### todos テーブルにカラム追加

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| isRecurring | BOOLEAN | DEFAULT false | 繰り返しタスクか |
| recurrencePattern | ENUM('daily','weekly','monthly') | NULLABLE | 繰り返しパターン |
| recurrenceInterval | INT | DEFAULT 1 | 繰り返し間隔 |
| recurrenceEndDate | DATE | NULLABLE | 繰り返し終了日 |
| originalTodoId | INT | FK (todos.id), NULLABLE | 元の Todo ID |

### インデックス追加

- todos: `isRecurring`, `originalTodoId`

---

## 🔌 API エンドポイント

```
POST /api/todos (recurrence フィールド追加)
PATCH /api/todos/:id/complete (繰り返しタスクの場合、次回生成)
```

---

## ✅ Backend 実装タスク

### Task 6.1: 繰り返しカラム追加

- [x] 6.1.1: マイグレーション生成 `add-recurrence-fields-to-todos`
- [x] 6.1.2: isRecurring, recurrencePattern, recurrenceInterval, recurrenceEndDate, originalTodoId カラム追加
- [x] 6.1.3: インデックス追加
- [x] 6.1.4: 外部キー制約追加（originalTodoId）
- [x] 6.1.5: マイグレーション実行

### Task 6.2: Todo モデル更新

- [x] 6.2.1: 繰り返しフィールド追加
- [x] 6.2.2: バリデーション実装

### Task 6.3: RecurrenceService 作成

- [ ] 6.3.1: `backend/services/RecurrenceService.js` 作成
- [ ] 6.3.2: `calculateNextDueDate(pattern, interval, currentDate)` 実装
- [ ] 6.3.3: `createNextOccurrence(todo)` 実装
- [ ] 6.3.4: `shouldCreateNext(todo)` 実装（終了日チェック）

### Task 6.4: TodoService に繰り返し機能追加

- [ ] 6.4.1: `createTodo` で繰り返し設定を保存
- [ ] 6.4.2: `toggleComplete` で繰り返しタスクの場合、次回生成
- [ ] 6.4.3: RecurrenceService 呼び出し

### Task 6.5: TodoController 更新

- [ ] 6.5.1: 繰り返しフィールドのバリデーション追加

### Task 6.6: Todo ルート更新

- [ ] 6.6.1: POST /api/todos の JSON Schema に繰り返しフィールド追加
- [ ] 6.6.2: PUT /api/todos/:id の JSON Schema に繰り返しフィールド追加

### Task 6.7: Backend テスト

- [ ] 6.7.1: RecurrenceService のテスト
- [ ] 6.7.2: 次回 Todo 生成のテスト
- [ ] 6.7.3: 繰り返し終了日のテスト

---

## ✅ Frontend 実装タスク

### Task 6.8: Recurrence インターフェース定義

- [ ] 6.8.1: `frontend/src/app/models/recurrence.interface.ts` 作成
- [ ] 6.8.2: RecurrencePattern enum 定義
- [ ] 6.8.3: Recurrence インターフェース定義

### Task 6.9: Todo インターフェース更新

- [ ] 6.9.1: Todo インターフェースに繰り返しフィールド追加

### Task 6.10: RecurrenceForm コンポーネント作成

- [ ] 6.10.1: `ng generate component components/recurrence-form` 実行
- [ ] 6.10.2: 繰り返しパターン選択実装
- [ ] 6.10.3: 繰り返し間隔入力実装
- [ ] 6.10.4: 終了日入力実装
- [ ] 6.10.5: @Output() recurrenceChanged 実装

### Task 6.11: TodoForm に繰り返し設定追加

- [ ] 6.11.1: RecurrenceForm コンポーネント統合
- [ ] 6.11.2: 繰り返し有効/無効トグル実装
- [ ] 6.11.3: フォーム送信時に繰り返し設定を含める

### Task 6.12: TodoItem に繰り返しアイコン追加

- [ ] 6.12.1: 繰り返しタスクの場合、アイコン表示
- [ ] 6.12.2: ツールチップで繰り返し設定表示

### Task 6.13: RecurringTodoList ページ作成

- [ ] 6.13.1: `ng generate component pages/recurring-todo-list-page` 実行
- [ ] 6.13.2: 繰り返しタスク一覧表示
- [ ] 6.13.3: ルーティング追加

### Task 6.14: スタイリング

- [ ] 6.14.1: 繰り返しアイコンのスタイル
- [ ] 6.14.2: 繰り返し設定フォームのスタイル

### Task 6.15: Frontend テスト

- [ ] 6.15.1: RecurrenceForm コンポーネントテスト
- [ ] 6.15.2: 繰り返しタスク表示のテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- 複雑度: 高（日付計算ロジック）
