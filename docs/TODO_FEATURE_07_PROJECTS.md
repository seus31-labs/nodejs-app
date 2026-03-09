# 機能7: カテゴリ/プロジェクト機能

---

## 📋 概要

Todo をプロジェクト単位でグループ化し、プロジェクトごとの進捗を表示。

---

## 🗄️ データモデル

### 新規テーブル: projects

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | プロジェクト ID |
| userId | INT | FK (users.id), NOT NULL | 所有ユーザー ID |
| name | VARCHAR(100) | NOT NULL | プロジェクト名 |
| description | TEXT | NULLABLE | 説明 |
| color | VARCHAR(7) | DEFAULT '#808080' | プロジェクト色 |
| archived | BOOLEAN | DEFAULT false | アーカイブ済みか |
| createdAt | TIMESTAMP | NOT NULL | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL | 更新日時 |

### todos テーブルにカラム追加

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| projectId | INT | FK (projects.id), NULLABLE | プロジェクト ID |

### インデックス

- projects: `userId`, `UNIQUE(userId, name)`
- todos: `projectId`

---

## 🔌 API エンドポイント

```
POST /api/projects
GET /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
GET /api/projects/:id/todos
GET /api/projects/:id/progress
PATCH /api/projects/:id/archive
```

---

## ✅ Backend 実装タスク

### Task 7.1: Project モデル作成

- [x] 7.1.1: マイグレーション生成 `create-projects`
- [x] 7.1.2: projects テーブル定義
- [x] 7.1.3: インデックス追加
- [x] 7.1.4: 外部キー制約追加
- [x] 7.1.5: `backend/models/Project.js` 作成
- [x] 7.1.6: Project モデル定義
- [x] 7.1.7: User との関連付け

### Task 7.2: todos テーブルに projectId 追加

- [x] 7.2.1: マイグレーション生成 `add-project-id-to-todos`
- [x] 7.2.2: projectId カラム追加
- [x] 7.2.3: インデックス追加
- [x] 7.2.4: 外部キー制約追加
- [x] 7.2.5: マイグレーション実行

### Task 7.3: Todo モデル更新

- [x] 7.3.1: projectId フィールド追加
- [x] 7.3.2: Project との関連付け（belongsTo）

### Task 7.4: Project モデルに関連付け追加

- [x] 7.4.1: hasMany(Todo) 追加

### Task 7.5: ProjectService 作成

- [x] 7.5.1: `backend/services/ProjectService.js` 作成
- [x] 7.5.2: `createProject(userId, projectData)` 実装
- [x] 7.5.3: `getProjectsByUserId(userId, includeArchived)` 実装
- [x] 7.5.4: `getProjectById(projectId, userId)` 実装
- [x] 7.5.5: `updateProject(projectId, userId, updateData)` 実装
- [x] 7.5.6: `deleteProject(projectId, userId)` 実装（Todo の処理）
- [x] 7.5.7: `archiveProject(projectId, userId)` 実装
- [x] 7.5.8: `getProjectProgress(projectId, userId)` 実装

### Task 7.6: TodoService にプロジェクト機能追加

- [x] 7.6.1: `getTodosByProjectId(projectId, userId)` 実装
- [x] 7.6.2: `getTodosByUserId` にプロジェクトフィルタ追加
- [x] 7.6.3: Todo 取得時にプロジェクトを include

### Task 7.7: ProjectController 作成

- [x] 7.7.1: `backend/controllers/ProjectController.js` 作成
- [x] 7.7.2: 各ハンドラ実装
- [x] 7.7.3: エラーハンドリング

### Task 7.8: Project ルート作成

- [x] 7.8.1: Project ルート定義（`backend/routes/api/v1/index.js` に追加）
- [x] 7.8.2: 各エンドポイントの JSON Schema 定義
- [x] 7.8.3: JWT 認証 preHandler 適用

### Task 7.9: Backend テスト

- [x] 7.9.1: ProjectService のテスト（API 経由で検証）
- [x] 7.9.2: Project API のテスト

---

## ✅ Frontend 実装タスク

### Task 7.10: Project インターフェース定義

- [x] 7.10.1: `frontend/src/app/models/project.interface.ts` 作成
- [x] 7.10.2: Project, CreateProjectDto, UpdateProjectDto 定義

### Task 7.11: Todo インターフェース更新

- [x] 7.11.1: Todo インターフェースに projectId, project 追加

### Task 7.12: ProjectService 作成

- [ ] 7.12.1: `frontend/src/app/services/project.service.ts` 作成
- [ ] 7.12.2: CRUD メソッド実装
- [ ] 7.12.3: `getProjectProgress(id: number)` 実装
- [ ] 7.12.4: `archiveProject(id: number)` 実装

### Task 7.13: ProjectList コンポーネント作成

- [ ] 7.13.1: `ng generate component components/project-list` 実行
- [ ] 7.13.2: プロジェクト一覧表示実装
- [ ] 7.13.3: プロジェクトカード形式で表示
- [ ] 7.13.4: 進捗バー表示

### Task 7.14: ProjectForm コンポーネント作成

- [ ] 7.14.1: `ng generate component components/project-form` 実行
- [ ] 7.14.2: Reactive Forms 実装
- [ ] 7.14.3: カラーピッカー実装

### Task 7.15: ProjectDetail ページ作成

- [ ] 7.15.1: `ng generate component pages/project-detail-page` 実行
- [ ] 7.15.2: プロジェクト詳細表示
- [ ] 7.15.3: プロジェクト内の Todo 一覧表示
- [ ] 7.15.4: ルーティング追加

### Task 7.16: TodoForm にプロジェクト選択追加

- [ ] 7.16.1: プロジェクト選択ドロップダウン追加
- [ ] 7.16.2: フォーム送信時に projectId を含める

### Task 7.17: TodoList にプロジェクトフィルタ追加

- [ ] 7.17.1: プロジェクトフィルタ UI 追加
- [ ] 7.17.2: フィルタ適用時に API 呼び出し

### Task 7.18: ProjectsPage 作成

- [ ] 7.18.1: `ng generate component pages/projects-page` 実行
- [ ] 7.18.2: ProjectList と ProjectForm 統合
- [ ] 7.18.3: ルーティング追加

### Task 7.19: ナビゲーション更新

- [ ] 7.19.1: メインナビゲーションに「プロジェクト」リンク追加

### Task 7.20: スタイリング

- [ ] 7.20.1: プロジェクトカードのスタイル
- [ ] 7.20.2: プロジェクト色の適用
- [ ] 7.20.3: レスポンシブ対応

### Task 7.21: Frontend テスト

- [ ] 7.21.1: ProjectService のテスト
- [ ] 7.21.2: 各コンポーネントのテスト

---

## 📝 依存関係

- 前提: Todo 基本機能が実装済み
