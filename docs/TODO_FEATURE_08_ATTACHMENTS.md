# 機能8: 添付ファイル機能

---

## 📋 概要

Todo に画像・PDF などのファイルを添付する機能。

---

## 🗄️ データモデル

### 新規テーブル: attachments

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | 添付ファイル ID |
| todoId | INT | FK (todos.id), NOT NULL | Todo ID |
| fileName | VARCHAR(255) | NOT NULL | ファイル名 |
| fileSize | INT | NOT NULL | ファイルサイズ（bytes） |
| mimeType | VARCHAR(100) | NOT NULL | MIME タイプ |
| fileUrl | VARCHAR(500) | NOT NULL | ファイル URL |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |

---

## 🔌 API エンドポイント

```
POST /api/todos/:todoId/attachments (multipart/form-data)
GET /api/todos/:todoId/attachments
DELETE /api/attachments/:id
```

---

## ✅ Backend 実装タスク

### Task 8.1: Attachment モデル作成

- [x] 8.1.1: マイグレーション生成 `create-attachments`
- [x] 8.1.2: attachments テーブル定義
- [x] 8.1.3: インデックス追加（todoId）
- [x] 8.1.4: 外部キー制約追加
- [x] 8.1.5: `backend/models/Attachment.js` 作成
- [x] 8.1.6: Attachment モデル定義
- [x] 8.1.7: Todo との関連付け
- [x] 8.1.8: マイグレーション実行

### Task 8.2: ファイルアップロード設定

- [x] 8.2.1: `@fastify/multipart` インストール
- [x] 8.2.2: Fastify multipart プラグイン登録
- [x] 8.2.3: アップロード制限設定（ファイルサイズ、MIME タイプ）

### Task 8.3: StorageService 作成

- [x] 8.3.1: `backend/services/StorageService.js` 作成
- [x] 8.3.2: ローカルストレージ実装（開発用）
- [x] 8.3.3: `uploadFile(file, todoId)` 実装
- [x] 8.3.4: `deleteFile(fileUrl)` 実装
- [x] 8.3.5: ファイル名のサニタイズ処理
- [x] 8.3.6: ユニークファイル名生成（UUID）

### Task 8.4: AttachmentService 作成

- [x] 8.4.1: `backend/services/AttachmentService.js` 作成
- [x] 8.4.2: `createAttachment(todoId, fileData)` 実装
- [x] 8.4.3: `getAttachmentsByTodoId(todoId, userId)` 実装
- [x] 8.4.4: `deleteAttachment(attachmentId, userId)` 実装
- [x] 8.4.5: StorageService 呼び出し

### Task 8.5: AttachmentController 作成

- [x] 8.5.1: `backend/controllers/AttachmentController.js` 作成
- [x] 8.5.2: `uploadAttachment` ハンドラ実装
- [x] 8.5.3: `getAttachments` ハンドラ実装
- [x] 8.5.4: `deleteAttachment` ハンドラ実装
- [x] 8.5.5: ファイルバリデーション

### Task 8.6: Attachment ルート作成

- [x] 8.6.1: `backend/routes/api/attachments.js` 作成
- [x] 8.6.2: POST /api/todos/:todoId/attachments のルート定義
- [x] 8.6.3: GET /api/todos/:todoId/attachments のルート定義
- [x] 8.6.4: DELETE /api/attachments/:id のルート定義
- [x] 8.6.5: JWT 認証 preHandler 適用

### Task 8.7: 静的ファイル配信設定

- [x] 8.7.1: `@fastify/static` インストール
- [x] 8.7.2: uploads ディレクトリの静的配信設定

### Task 8.8: Backend テスト

- [x] 8.8.1: StorageService のテスト
- [x] 8.8.2: AttachmentService のテスト
- [x] 8.8.3: Attachment API のテスト

---

## ✅ Frontend 実装タスク

### Task 8.9: Attachment インターフェース定義

- [x] 8.9.1: `frontend/src/app/models/attachment.interface.ts` 作成
- [x] 8.9.2: Attachment インターフェース定義

### Task 8.10: AttachmentService 作成

- [x] 8.10.1: `frontend/src/app/services/attachment.service.ts` 作成
- [x] 8.10.2: `uploadAttachment(todoId: number, file: File): Observable<Attachment>` 実装
- [x] 8.10.3: `getAttachments(todoId: number): Observable<Attachment[]>` 実装
- [x] 8.10.4: `deleteAttachment(id: number): Observable<void>` 実装
- [x] 8.10.5: アップロード進捗の実装

### Task 8.11: FileUpload コンポーネント作成

- [x] 8.11.1: `ng generate component components/file-upload` 実行
- [x] 8.11.2: ファイル選択 UI 実装
- [x] 8.11.3: ドラッグ&ドロップ実装
- [x] 8.11.4: アップロード進捗バー表示
- [x] 8.11.5: @Input() todoId: number 実装
- [x] 8.11.6: @Output() uploaded 実装

### Task 8.12: AttachmentList コンポーネント作成

- [x] 8.12.1: `ng generate component components/attachment-list` 実行
- [x] 8.12.2: 添付ファイル一覧表示
- [x] 8.12.3: ファイルアイコン表示（MIME タイプ別）
- [x] 8.12.4: ダウンロードボタン実装
- [x] 8.12.5: 削除ボタン実装
- [x] 8.12.6: @Input() todoId: number 実装

### Task 8.13: TodoDetail に添付ファイル機能追加

- [x] 8.13.1: FileUpload コンポーネント追加
- [x] 8.13.2: AttachmentList コンポーネント追加

### Task 8.14: スタイリング

- [x] 8.14.1: ファイルアップロード UI のスタイル
- [x] 8.14.2: ドラッグ&ドロップ領域のスタイル
- [x] 8.14.3: 添付ファイル一覧のスタイル

### Task 8.15: Frontend テスト

- [ ] 8.15.1: AttachmentService のテスト
- [ ] 8.15.2: FileUpload コンポーネントテスト
- [ ] 8.15.3: AttachmentList コンポーネントテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
- 複雑度: 高（ファイルアップロード処理）
- 将来: S3 や Cloudinary への移行を検討
