# 機能4: 期限リマインダー

---

## 📋 概要

期限が近い Todo をブラウザ通知で知らせる機能。

---

## 🗄️ データモデル

### todos テーブルにカラム追加

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| reminderEnabled | BOOLEAN | DEFAULT true | リマインダー有効/無効 |
| reminderSentAt | TIMESTAMP | NULLABLE | 最後にリマインダー送信した日時 |

---

## 🔌 API エンドポイント

```
GET /api/todos/due-soon
PATCH /api/todos/:id/reminder
```

---

## ✅ Backend 実装タスク

### Task 4.1: リマインダーカラム追加

- [x] 4.1.1: マイグレーション生成 `add-reminder-fields-to-todos`
- [x] 4.1.2: reminderEnabled, reminderSentAt カラム追加
- [ ] 4.1.3: マイグレーション実行

### Task 4.2: Todo モデル更新

- [x] 4.2.1: reminderEnabled, reminderSentAt フィールド追加

### Task 4.3: TodoService にリマインダー機能追加

- [x] 4.3.1: `getDueSoonTodos(userId)` 実装（24時間以内の期限）
- [x] 4.3.2: `toggleReminder(todoId, userId, enabled)` 実装
- [x] 4.3.3: `markReminderSent(todoId)` 実装

### Task 4.4: TodoController にリマインダー機能追加

- [x] 4.4.1: `getDueSoonTodos` ハンドラ実装
- [x] 4.4.2: `toggleReminder` ハンドラ実装

### Task 4.5: Todo ルート更新

- [x] 4.5.1: GET /api/todos/due-soon のルート定義
- [x] 4.5.2: PATCH /api/todos/:id/reminder のルート定義
- [x] 4.5.3: JSON Schema 定義

### Task 4.6: Backend テスト

- [ ] 4.6.1: TodoService リマインダー機能のテスト
- [x] 4.6.2: リマインダー API のテスト

---

## ✅ Frontend 実装タスク

### Task 4.7: TodoService にリマインダー機能追加

- [x] 4.7.1: `getDueSoonTodos(): Observable<Todo[]>` 実装
- [x] 4.7.2: `toggleReminder(id: number, enabled: boolean): Observable<Todo>` 実装

### Task 4.8: NotificationService 作成

- [x] 4.8.1: `frontend/src/app/services/notification.service.ts` 作成
- [x] 4.8.2: ブラウザ通知権限リクエスト実装
- [x] 4.8.3: `showNotification(title, body, data)` 実装
- [x] 4.8.4: 通知クリック時の処理実装

### Task 4.9: ReminderService 作成

- [x] 4.9.1: `frontend/src/app/services/reminder.service.ts` 作成
- [x] 4.9.2: 定期チェック処理実装（5分ごと）
- [x] 4.9.3: 期限が近い Todo の通知送信
- [x] 4.9.4: 通知済みフラグ管理（LocalStorage）

### Task 4.10: TodoItem にリマインダー切り替え追加

- [ ] 4.10.1: リマインダー ON/OFF トグルボタン追加
- [ ] 4.10.2: @Output() reminderToggled 実装

### Task 4.11: ReminderSettings コンポーネント作成

- [ ] 4.11.1: `ng generate component components/reminder-settings` 実行
- [ ] 4.11.2: 通知権限リクエストボタン実装
- [ ] 4.11.3: リマインダー設定 UI 実装
- [ ] 4.11.4: 通知テストボタン実装

### Task 4.12: App 初期化時にリマインダー開始

- [ ] 4.12.1: AppComponent で ReminderService 初期化
- [ ] 4.12.2: ログイン時にリマインダー開始
- [ ] 4.12.3: ログアウト時にリマインダー停止

### Task 4.13: スタイリング

- [ ] 4.13.1: リマインダーアイコンのスタイル
- [ ] 4.13.2: 通知設定画面のスタイル

### Task 4.14: Frontend テスト

- [x] 4.14.1: NotificationService のテスト
- [x] 4.14.2: ReminderService のテスト
- [ ] 4.14.3: ReminderSettings コンポーネントテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- ブラウザ: Notification API サポート必須
