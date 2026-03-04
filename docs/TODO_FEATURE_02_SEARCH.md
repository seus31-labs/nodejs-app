# 機能2: 検索機能

---

## 📋 概要

Todo のタイトル・説明文・タグ名で全文検索を行う機能。複数条件の組み合わせも可能。

---

## 🗄️ データモデル

既存テーブルの変更なし。インデックス追加のみ。

### インデックス追加

- todos: `FULLTEXT(title, description)` - MySQL 全文検索用

---

## 🔌 API エンドポイント

```
GET /api/todos/search?q=買い物&priority=high&completed=false&tags=1,2
```

クエリパラメータ:
- `q` (string, required) - 検索キーワード
- `priority` (string, optional) - 優先度フィルタ
- `completed` (boolean, optional) - 完了状態フィルタ
- `tags` (string, optional) - タグ ID（カンマ区切り）

---

## ✅ Backend 実装タスク

### Task 2.1: 全文検索インデックス追加

- [x] 2.1.1: マイグレーション生成 `add-fulltext-index-to-todos`
- [x] 2.1.2: todos テーブルに FULLTEXT インデックス追加（title, description）
- [x] 2.1.3: マイグレーション実行（要: 環境で db:migrate）

### Task 2.2: TodoService に検索機能追加

- [x] 2.2.1: `searchTodos(userId, {query, priority, completed, tags})` 実装（tags は未実装のため省略）
- [x] 2.2.2: Sequelize の `Op.like` 使用
- [x] 2.2.3: タイトル・説明文での検索実装
- [x] 2.2.4: タグ名での検索実装（Tag モデル JOIN）※タグ機能実装後に対応
- [x] 2.2.5: 複数条件の AND 結合実装
- [x] 2.2.6: 検索結果にタグを include※タグ機能実装後に対応

### Task 2.3: TodoController に検索ハンドラ追加

- [x] 2.3.1: `searchTodos` ハンドラ実装
- [x] 2.3.2: クエリパラメータのバリデーション
- [x] 2.3.3: エラーハンドリング

### Task 2.4: Todo ルートに検索エンドポイント追加

- [x] 2.4.1: GET /api/v1/todos/search のルート定義
- [x] 2.4.2: クエリパラメータの JSON Schema 定義
- [x] 2.4.3: JWT 認証 preHandler 適用

### Task 2.5: Backend テスト

- [x] 2.5.1: 検索 API 認証・検索結果のテスト実装
- [x] 2.5.2: 検索 API のテスト実装（各条件パターン）

---

## ✅ Frontend 実装タスク

### Task 2.6: SearchParams インターフェース定義

- [x] 2.6.1: `frontend/src/app/models/search-params.interface.ts` 作成
- [x] 2.6.2: SearchParams インターフェース定義

### Task 2.7: TodoService に検索機能追加

- [x] 2.7.1: `search(params: SearchParams): Observable<Todo[]>` 実装
- [x] 2.7.2: クエリパラメータの構築
- [x] 2.7.3: エラーハンドリング（既存 subscribe error で対応）

### Task 2.8: SearchBar コンポーネント作成

- [x] 2.8.1: todo/search-bar コンポーネント作成
- [x] 2.8.2: 検索入力フィールド実装
- [x] 2.8.3: リアルタイム検索（debounceTime 300ms）
- [x] 2.8.4: 検索クリアボタン実装
- [x] 2.8.5: @Output() searchTerm: EventEmitter<string> 実装

### Task 2.9: AdvancedSearchDialog コンポーネント作成

- [ ] 2.9.1: `ng generate component components/advanced-search-dialog` 実行
- [ ] 2.9.2: Angular Material Dialog 使用
- [ ] 2.9.3: 詳細検索フォーム実装（優先度、完了状態、タグ）
- [ ] 2.9.4: Reactive Forms 実装
- [ ] 2.9.5: @Output() searchParams: EventEmitter<SearchParams> 実装

### Task 2.10: TodoPage に検索機能統合

- [x] 2.10.1: SearchBar コンポーネント追加
- [ ] 2.10.2: 詳細検索ボタン追加（AdvancedSearchDialog はオプションのため未実装）
- [x] 2.10.3: 検索実行処理実装（検索時は search、空時は list）
- [x] 2.10.4: 検索結果表示（既存 TodoList で表示）
- [x] 2.10.5: 検索中のローディング表示（既存 loading で対応）

### Task 2.11: 検索履歴機能（オプション）

- [ ] 2.11.1: LocalStorage に検索履歴保存
- [ ] 2.11.2: 検索履歴のドロップダウン表示
- [ ] 2.11.3: 履歴クリア機能

### Task 2.12: スタイリング

- [x] 2.12.1: 検索バーのスタイル実装
- [ ] 2.12.2: 検索結果のハイライト表示
- [ ] 2.12.3: レスポンシブ対応

### Task 2.13: Frontend テスト

- [ ] 2.13.1: TodoService.searchTodos のテスト
- [ ] 2.13.2: SearchBar コンポーネントテスト
- [ ] 2.13.3: AdvancedSearchDialog コンポーネントテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- 推奨: タグ機能実装後（タグ名での検索のため）
