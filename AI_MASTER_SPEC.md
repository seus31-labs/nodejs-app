# 📝 AI Development Master Specification (2026.02.02)

## 1. 📂 プロジェクトのアイデンティティとコンテキスト
- **ロール**: シニア・ソフトウェアアーキテクト & フルスタックエンジニア
- **ミッション**: 高い保守性とスケーラビリティを持ち、AIによる継続的な修正に耐えうる堅牢なコードベースの構築。
- **コミュニケーション**: 簡潔かつ技術的に正確な表現を用い、曖昧さを排除する。

## 2. 🏗️ アーキテクチャ & ベストプラクティス (2026年標準)
- **Feature-Based Module**: 技術レイヤー（components/api）ではなく、機能単位（features/billing, features/auth）でディレクトリを構成する。
- **Type-Safe First**: 実装の前に必ずスキーマ（Zod, Pydantic, TypeScript Interface）を定義し、AIとの認識のズレを防止する。
- **Single Source of Truth**: ロジックの重複を排除し、定数や型定義を一元管理する。
- **DRY & AHA**: 拙速な共通化を避け、再利用性が確定してから抽象化を行う（Avoid Hasty Abstraction）。

## 3. 🧠 アルゴリズム & ロジック方針
- **計算効率**: 計算量 O(n log n) を超える処理については代替案を検討し、早期リターン（ガード句）を徹底する。
- **モダンな状態管理**: グローバルな状態を最小限にし、サーバー状態（React Query/SWR）とローカル状態（Signals/Context）を明確に分離する。
- **堅牢なエラーハンドリング**: エラーを握りつぶさず、Result型パターンや専用エラークラスを用いて、呼び出し側に安全にエラーを伝える。

## 4. 🤖 AIツール別同期（必須生成ファイル）
各ツールに対し、本ファイルを「真実のソース（Source of Truth）」として読み込ませ、以下のファイルを生成・更新させる。

| ファイル名 | 対象ツール | 生成・更新の定義 |
| :--- | :--- | :--- |
| `.cursor/rules/*.mdc` | **Cursor** | ディレクトリごとの制約、言語別Lint、ライブラリ使用指針 |
| `CLAUDE.md` | **Claude Code** | ビルド・テストコマンド、プロジェクト概要、命名規則の明示 |
| `AGENTS.md` | **All Agents** | 現在の進捗状況、技術的負債、次に着手すべきタスクの記録 |
| `.clinerules` | **Roo Code** | ファイル操作権限、推奨パッケージ、書き換え禁止ルールの定義 |

## 5. 🛡️ セキュリティ & 品質保証
- **Shift-Left Security**: 環境変数(.env)の徹底管理、Zod等による入力バリデーション、OWASP Top 10の考慮。
- **Test-Driven AI**: 複雑なロジックを生成する前に、まずテストコード（Vitest, Pytest等）をAIに書かせ、パスすることを確認する。
- **Documentation**: AIが検索・理解しやすいようJSDoc/Docstringを付与し、複雑なロジックには「なぜこの実装か」の意図を含める。

## 6. 🛠️ 技術スタック特定事項 (Placeholder)
<!-- プロジェクトごとに以下を書き換えてください -->
- **Frontend**: [例: Next.js 15 (App Router), Tailwind CSS, shadcn/ui]
- **Backend**: [例: Go (Echo), PostgreSQL, Prisma]
- **Infrastructure**: [例: Vercel, Docker, GitHub Actions]

