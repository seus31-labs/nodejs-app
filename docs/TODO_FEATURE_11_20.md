# 機能11-20: 詳細設計（簡易版）

---

## 機能11: Todo の共有機能

### データモデル
- 新規テーブル: `todo_shares` (id, todoId, sharedWithUserId, permission, createdAt)
- permission: ENUM('view', 'edit')

### Backend タスク（15タスク）
- [ ] 11.1: TodoShare モデル作成（マイグレーション、モデル定義）
- [ ] 11.2: ShareService 作成（共有、権限チェック、共有解除）
- [ ] 11.3: ShareController 作成
- [ ] 11.4: Share ルート作成（POST /api/todos/:id/share, GET /api/todos/shared, DELETE /api/shares/:id）
- [ ] 11.5: TodoService に共有チェック追加
- [ ] 11.6: Backend テスト

### Frontend タスク（10タスク）
- [ ] 11.7: Share インターフェース定義
- [ ] 11.8: ShareService 作成
- [ ] 11.9: ShareDialog コンポーネント作成（ユーザー検索、権限選択）
- [ ] 11.10: TodoItem に共有ボタン追加
- [ ] 11.11: SharedTodosPage 作成
- [ ] 11.12: Frontend テスト

---

## 機能12: カレンダービュー

### 依存ライブラリ
- Backend: なし
- Frontend: `@fullcalendar/angular`, `@fullcalendar/core`, `@fullcalendar/daygrid`

### Backend タスク（5タスク）
- [ ] 12.1: TodoService に日付範囲フィルタ追加
- [ ] 12.2: GET /api/todos?startDate=&endDate= 実装
- [ ] 12.3: Backend テスト

### Frontend タスク（12タスク）
- [ ] 12.4: FullCalendar インストール
- [ ] 12.5: CalendarView コンポーネント作成
- [ ] 12.6: Todo を FullCalendar イベントに変換
- [ ] 12.7: イベントクリックで Todo 詳細表示
- [ ] 12.8: ドラッグ&ドロップで期限変更
- [ ] 12.9: CalendarPage 作成
- [ ] 12.10: ルーティング追加
- [ ] 12.11: スタイリング
- [ ] 12.12: Frontend テスト

---

## 機能13: 統計・分析機能

### データモデル
- 既存テーブルのみ使用（集計クエリ）

### Backend タスク（10タスク）
- [ ] 13.1: AnalyticsService 作成
- [ ] 13.2: `getCompletionRate(userId, period)` 実装
- [ ] 13.3: `getTodosByPriority(userId)` 実装
- [ ] 13.4: `getTodosByTag(userId)` 実装
- [ ] 13.5: `getTodosByProject(userId)` 実装
- [ ] 13.6: `getWeeklyStats(userId)` 実装
- [ ] 13.7: AnalyticsController 作成
- [ ] 13.8: Analytics ルート作成（GET /api/analytics/*)
- [ ] 13.9: Backend テスト

### Frontend タスク（15タスク）
- [ ] 13.10: AnalyticsService 作成
- [ ] 13.11: CompletionRateChart コンポーネント作成（ApexCharts 使用）
- [ ] 13.12: PriorityDistributionChart コンポーネント作成
- [ ] 13.13: TagDistributionChart コンポーネント作成
- [ ] 13.14: WeeklyActivityChart コンポーネント作成
- [ ] 13.15: AnalyticsPage 作成（各チャート統合）
- [ ] 13.16: ルーティング追加
- [ ] 13.17: スタイリング
- [ ] 13.18: Frontend テスト

---

## 機能14: テンプレート機能

### データモデル
- 新規テーブル: `todo_templates` (id, userId, name, title, description, priority, tags, createdAt)

### Backend タスク（12タスク）
- [x] 14.1: TodoTemplate モデル作成
- [x] 14.2: TemplateService 作成（CRUD、テンプレートから Todo 作成）
- [x] 14.3: TemplateController 作成
- [x] 14.4: Template ルート作成
- [x] 14.5: Backend テスト

### Frontend タスク（12タスク）
- [x] 14.6: Template インターフェース定義
- [x] 14.7: TemplateService 作成
- [x] 14.8: TemplateList コンポーネント作成
- [x] 14.9: TemplateForm コンポーネント作成
- [x] 14.10: TodoForm にテンプレート選択追加
- [x] 14.11: TemplatesPage 作成
- [x] 14.12: Frontend テスト

---

## 機能15: 一括操作

### データモデル
- 既存テーブルのみ使用

### Backend タスク（8タスク）
- [x] 15.1: TodoService に一括操作メソッド追加
- [x] 15.2: `bulkComplete(todoIds, userId)` 実装
- [x] 15.3: `bulkDelete(todoIds, userId)` 実装
- [x] 15.4: `bulkAddTag(todoIds, tagId, userId)` 実装
- [x] 15.5: `bulkArchive(todoIds, userId)` 実装
- [x] 15.6: TodoController に一括操作ハンドラ追加
- [x] 15.7: POST /api/todos/bulk-* ルート定義
- [x] 15.8: Backend テスト

### Frontend タスク（10タスク）
- [x] 15.9: TodoService に一括操作メソッド追加
- [x] 15.10: TodoList に複数選択機能追加（チェックボックス）
- [x] 15.11: BulkActionBar コンポーネント作成
- [x] 15.12: 一括完了ボタン実装
- [x] 15.13: 一括削除ボタン実装（確認ダイアログ）
- [x] 15.14: 一括タグ付けボタン実装
- [x] 15.15: 一括アーカイブボタン実装
- [x] 15.16: スタイリング
- [x] 15.17: Frontend テスト

---

## 機能16: ダークモード

### データモデル
- なし（LocalStorage で設定保存）

### Backend タスク
- なし

### Frontend タスク（8タスク）
- [x] 16.1: ThemeService 作成
- [x] 16.2: ダーク/ライトテーマ定義（Angular Material）
- [x] 16.3: テーマ切り替え処理実装
- [x] 16.4: LocalStorage に設定保存
- [x] 16.5: ThemeToggle コンポーネント作成
- [x] 16.6: ナビゲーションにテーマ切り替えボタン追加
- [x] 16.7: カスタム CSS 変数でダークモード対応
- [x] 16.8: Frontend テスト

---

## 機能17: エクスポート/インポート

### データモデル
- 既存テーブルのみ使用

### Backend タスク（10タスク）
- [x] 17.1: ExportService 作成
- [x] 17.2: `exportTodosAsJSON(userId)` 実装
- [x] 17.3: `exportTodosAsCSV(userId)` 実装
- [x] 17.4: ImportService 作成
- [x] 17.5: `importTodosFromJSON(userId, data)` 実装
- [x] 17.6: `importTodosFromCSV(userId, data)` 実装
- [x] 17.7: ExportController, ImportController 作成
- [x] 17.8: GET /api/todos/export, POST /api/todos/import ルート定義
- [x] 17.9: Backend テスト

### Frontend タスク（10タスク）
- [x] 17.10: ExportService 作成
- [x] 17.11: エクスポートボタン実装（JSON/CSV 選択）
- [x] 17.12: ファイルダウンロード処理実装
- [x] 17.13: ImportDialog コンポーネント作成
- [x] 17.14: ファイル選択 UI 実装
- [x] 17.15: インポート処理実装
- [x] 17.16: インポート結果表示（成功/失敗件数）
- [x] 17.17: スタイリング
- [x] 17.18: Frontend テスト

---

## 機能18: 音声入力

### 依存ライブラリ
- Frontend: Web Speech API（ブラウザ標準）

### Backend タスク
- なし

### Frontend タスク（10タスク）
- [x] 18.1: SpeechRecognitionService 作成
- [x] 18.2: Web Speech API ラッパー実装
- [x] 18.3: ブラウザ対応チェック実装
- [x] 18.4: VoiceInput コンポーネント作成
- [x] 18.5: マイクボタン実装
- [x] 18.6: 音声認識開始/停止処理
- [x] 18.7: 認識結果をテキストに変換
- [x] 18.8: TodoForm に音声入力ボタン追加
- [x] 18.9: スタイリング（録音中アニメーション）
- [x] 18.10: Frontend テスト

---

## 機能19: ショートカットキー

### データモデル
- なし

### Backend タスク
- なし

### Frontend タスク（12タスク）
- [x] 19.1: KeyboardShortcutService 作成
- [x] 19.2: ショートカット定義（Ctrl+N: 新規作成、Ctrl+F: 検索など）
- [x] 19.3: キーイベントリスナー実装
- [x] 19.4: ショートカット実行処理実装
- [x] 19.5: ショートカット無効化処理（入力フォーカス時）
- [x] 19.6: ShortcutHelp コンポーネント作成
- [x] 19.7: ショートカット一覧表示
- [x] 19.8: ヘルプダイアログ実装（? キーで表示）
- [ ] 19.9: カスタマイズ機能（オプション）
- [x] 19.10: スタイリング
- [x] 19.11: Frontend テスト

---

## 機能20: オフライン対応

### 依存ライブラリ
- Frontend: `@angular/service-worker`

### Backend タスク
- なし

### Frontend タスク（15タスク）
- [x] 20.1: Service Worker 設定
- [x] 20.2: `ng add @angular/pwa` 実行（ng generate service-worker + 手動設定）
- [x] 20.3: IndexedDB ラッパーサービス作成
- [x] 20.4: OfflineStorageService 作成
- [x] 20.5: オンライン/オフライン検知実装
- [x] 20.6: オフライン時のデータ保存実装
- [x] 20.7: オンライン復帰時の同期処理実装
- [x] 20.8: 競合解決ロジック実装
- [ ] 20.9: SyncService 作成
- [x] 20.10: オフラインインジケーター表示
- [ ] 20.11: 同期状態表示
- [x] 20.12: manifest.json 設定
- [ ] 20.13: アイコン設定
- [ ] 20.14: スタイリング
- [ ] 20.15: Frontend テスト

---

## 📝 実装優先度まとめ

### 短期（1-4週）
- 機能15: 一括操作（低複雑度、高価値）
- 機能10: アーカイブ（低複雑度）
- 機能16: ダークモード（低複雑度）
- 機能14: テンプレート（中複雑度）

### 中期（5-12週）
- 機能13: 統計・分析（中複雑度、高価値）
- 機能12: カレンダービュー（中複雑度）
- 機能17: エクスポート/インポート（中複雑度）
- 機能19: ショートカットキー（低複雑度）

### 長期（13週以降）
- 機能11: 共有機能（高複雑度）
- 機能18: 音声入力（中複雑度）
- 機能20: オフライン対応（高複雑度）
