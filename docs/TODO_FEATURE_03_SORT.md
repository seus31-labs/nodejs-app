# 機能3: ソート機能

---

## 📋 概要

Todo を期限順・優先度順・作成日順・更新日順でソート。ドラッグ&ドロップで手動並び替えも可能。

---

## 🗄️ データモデル

### todos テーブルにカラム追加

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| sortOrder | INT | DEFAULT 0 | カスタムソート順序 |

### インデックス追加

- todos: `sortOrder`

---

## 🔌 API エンドポイント

```
GET /api/todos?sortBy=dueDate&sortOrder=asc
PUT /api/todos/reorder
```

クエリパラメータ:
- `sortBy` (string, optional) - ソート基準（dueDate, priority, createdAt, updatedAt, sortOrder）
- `sortOrder` (string, optional) - ソート順（asc, desc）

---

## ✅ Backend 実装タスク

### Task 3.1: sortOrder カラム追加

- [x] 3.1.1: マイグレーション生成 `add-sort-order-to-todos`
- [x] 3.1.2: todos テーブルに sortOrder カラム追加
- [x] 3.1.3: インデックス追加
- [x] 3.1.4: マイグレーション実行

### Task 3.2: Todo モデル更新

- [x] 3.2.1: Todo モデルに sortOrder フィールド追加
- [x] 3.2.2: デフォルト値設定

### Task 3.3: TodoService にソート機能追加

- [x] 3.3.1: `getTodosByUserId` にソートパラメータ追加
- [x] 3.3.2: sortBy に応じた ORDER BY 句生成
- [x] 3.3.3: priority のソート順序定義（high > medium > low）
- [x] 3.3.4: `reorderTodos(userId, todoIds)` 実装
- [x] 3.3.5: 一括更新処理実装（トランザクション使用）

### Task 3.4: TodoController にソート機能追加

- [x] 3.4.1: `getTodos` ハンドラにソートパラメータ処理追加
- [x] 3.4.2: `reorderTodos` ハンドラ実装
- [x] 3.4.3: バリデーション（sortBy の値チェック）

### Task 3.5: Todo ルート更新

- [x] 3.5.1: GET /api/todos のクエリパラメータに sortBy, sortOrder 追加
- [x] 3.5.2: PUT /api/todos/reorder のルート定義
- [x] 3.5.3: JSON Schema 定義（todoIds: array of integers）

### Task 3.6: Backend テスト

- [x] 3.6.1: TodoService ソート機能のテスト
- [x] 3.6.2: reorderTodos のテスト
- [x] 3.6.3: ソート API のテスト

---

## ✅ Frontend 実装タスク

### Task 3.7: SortOptions インターフェース定義

- [x] 3.7.1: `frontend/src/app/models/sort-options.interface.ts` 作成
- [x] 3.7.2: SortOptions インターフェース定義
- [x] 3.7.3: SortBy enum 定義

### Task 3.8: TodoService にソート機能追加

- [x] 3.8.1: `getTodos` にソートパラメータ追加
- [x] 3.8.2: `reorderTodos(todoIds: number[]): Observable<void>` 実装

### Task 3.9: SortSelector コンポーネント作成

- [x] 3.9.1: `ng generate component components/sort-selector` 実行
- [x] 3.9.2: ソート基準選択ドロップダウン実装
- [x] 3.9.3: ソート順序切り替えボタン実装（昇順/降順）
- [x] 3.9.4: @Output() sortChanged: EventEmitter<SortOptions> 実装

### Task 3.10: TodoList にドラッグ&ドロップ追加

- [x] 3.10.1: `@angular/cdk/drag-drop` インストール
- [x] 3.10.2: cdkDropList ディレクティブ適用
- [x] 3.10.3: cdkDrag ディレクティブ適用
- [x] 3.10.4: drop イベントハンドラ実装
- [x] 3.10.5: 並び替え後に API 呼び出し

### Task 3.11: TodoPage にソート機能統合

- [x] 3.11.1: SortSelector コンポーネント追加
- [x] 3.11.2: ソート変更時に Todo 再取得
- [x] 3.11.3: カスタムソート時のみドラッグ&ドロップ有効化

### Task 3.12: スタイリング

- [x] 3.12.1: ドラッグ中のスタイル実装
- [x] 3.12.2: ドロップ可能領域のハイライト
- [x] 3.12.3: ソートインジケーター表示

### Task 3.13: Frontend テスト

- [x] 3.13.1: TodoService ソート機能のテスト
- [x] 3.13.2: SortSelector コンポーネントテスト
- [x] 3.13.3: ドラッグ&ドロップのテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
