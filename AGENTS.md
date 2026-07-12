# プロジェクト概要
SvelteKit と Svelte 5 を用いたモダンで高速なシングルページアプリケーション（SPA） / 静的ウェブアプリケーションです。
本ドキュメントは、このプロジェクトのアーキテクチャやコードスタイルを再現し、一貫性のある新規機能開発やリファクタリングをAIエージェントが効率よく行うための開発ガイドライン（テンプレート）です。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Svelte 5 (Runes モード) + SvelteKit 3 |
| CSS | Tailwind CSS v4 |
| アダプター | @sveltejs/adapter-static（SPA / 静的サイト） |
| リンター | ESLint (flat config) + typescript-eslint |
| パッケージ管理 | pnpm（workspace 構成） |

## 開発環境セットアップ

```bash
pnpm install # 依存関係のインストール
pnpm run dev # 開発サーバー起動（LAN公開）
pnpm run dev:local # 開発サーバー起動（localhostのみ）
pnpm run build # プロダクションビルド
pnpm run preview # ビルド結果のプレビュー
pnpm check # 型チェック
pnpm lint # リンター
```

## 推ね奨ディレクトリ構造
プロジェクトは以下のレイヤー別構成に準拠します。新しいドメインや機能を追加する際は、この構成に沿ってファイルを配置してください。

```
src/
├── lib/
│   ├── assets/        # 画像、アイコン、音声などの静的アセット
│   ├── components/    # 複数のページで共有される再利用可能なUIコンポーネント
│   ├── paraglide/     # 国際化(i18n)関連の自動生成ファイル
│   ├── schema/        # Zodなどを用いたランタイムバリデーションスキーマ
│   ├── stores/        # Svelte 5 の Runes を用いた状態管理ストア
│   ├── types/         # TypeScriptの型定義（純粋な型のみを配置、i18n依存を避ける）
│   ├── utils/         # 汎用的なヘルパー・ユーティリティ（LocalStorageManagerなど）
│   └── workers/       # Web Worker関連のスクリプト
└── routes/            # ページルーティングとルート固有のコンポーネント
```

## 主要な設計パターン

### 1. Svelte 5 Runes モード
プロジェクト全体で Svelte 5 の Runes モードが有効です。開発にあたっては以下のルールを徹底してください。

- **状態の定義 (`$state`)**:
  - リアクティブな状態を宣言する場合は `$state(...)` を使用します。
  - 基本的に、状態の変更はコンポーネント内またはクラスストア（後述）のメソッドを通じてのみ行います。
- **派生状態 (`$derived` / `$derived.by`)**:
  - 他の状態から計算可能な値は、必ず `$derived(...)` または `$derived.by(() => { ... })` を使用してください。
  - `$derived.by` はローカル変数や複雑な条件分岐、ループを含む高度な計算が必要な場合に用います。
- **副作用の抑制 (`$effect`)**:
  - `$effect(...)` はDOMとのやり取りや外部APIとの通信、イベントリスナーの設定などの副作用処理にのみ使用してください。
  - 状態変更の伝播のために `$effect` を使用することは避け、代わりに `$derived` またはイベントハンドラーを用いてください。
- **コンポーネントの Props (`$props`)**:
  - 親コンポーネントから受け取る Props は、すべてオブジェクトの分割代入として `$props` から取得します。
    ```svelte
    <script lang="ts">
        let { title, active = false, onchange } = $props<{
            title: string;
            active?: boolean;
            onchange: (active: boolean) => void;
        }>();
    </script>
    ```
- **コンテンツ挿入 (`{#snippet}`)**:
  - スロット（Slot）の代わりに Svelte 5 の `{#snippet}` 構文を使用します。
  - 親からコンポーネントへUIパーツを柔軟に渡す場合は、スニペットを Props として定義・注入します。

### 2. クラスベース状態管理 (Class Store パターン)
複雑な状態管理やビジネスロジックは、Svelte 5 の `$state` をメンバに持つ**クラスストア**にカプセル化し、ストアはシングルトンインスタンスとしてエクスポートします。

- **設計の原則**:
  - 状態（`$state`）はプライベートまたは読み取り専用ゲッター（`get data()`）を通して外部に公開し、意図しない外部直接書き換えを防ぎます。
  - 状態の変更は、すべてクラス内に用意した明示的な `public` メソッド（`save()`, `reset()`, `update()` など）を経由して行います。
  - メソッド内では必要に応じて `untrack` を用い、不要なリアクティブ依存を回避します。
- **実装テンプレート**:
  ```typescript
  import { untrack } from "svelte";

  export class TodoStore {
      // プライベートなリアクティブ状態
      private _todos = $state<Array<{ id: string; text: string; completed: boolean }>>([]);
      private _loading = $state(false);

      public get todos() { return this._todos; }
      public get loading() { return this._loading; }

      public addTodo(text: string) {
          untrack(() => {
              this._todos.push({
                  id: crypto.randomUUID(),
                  text,
                  completed: false
              });
          });
      }

      public toggleTodo(id: string) {
          const todo = this._todos.find(t => t.id === id);
          if (todo) {
              todo.completed = !todo.completed;
          }
      }
  }

  // シングルトンインスタンスとしてエクスポート
  export const todoStore = new TodoStore();
  ```

### 3. 国際化 (i18n) パターン
国際化（日本語・英語など）には `@inlang/paraglide-js` を採用しています。

- **ルール**:
  - ユーザーインターフェース上のすべてのテキストは、直接ハードコードせず `$lib/paraglide/messages` からインポートした `m.[message_key]()` を通じて取得してください。
  - プレースホルダーの動的割り当てを行う場合は、オブジェクト引数を渡します（例: `m.hello({ name: "User" })`）。
  - `messages` 関数呼び出しはリアクティブに動作するため、コンポーネントのマークアップ内や `$derived` 内で評価される必要があります。
  - **重要**: 型定義ファイル（`types/`）の中に `m.[message_key]()` などのランタイムな多言語呼び出しを組み込まないでください。型ファイルが i18n メッセージと結合すると、循環参照やパースエラーを誘発します。これらはコンポーネント、または別ファイルの定数（`constants/` やストア）に配置してください。

### 4. データバリデーション & 永続化
ローカルストレージなどへのデータの永続化と、読み込み時のスキーマ検証は、`Zod` スキーマと `LocalStorageManager` などのマネージャーを併用します。

- **ルール**:
  - 保存対象となるデータの型や境界条件は、必ず `Zod` スキーマ（`src/lib/schema/`）として定義します。
  - `LocalStorageManager` を用いて、起動時のデータロード時に `safeParse` による検証を行い、異常データや古いスキーマを検出した場合はデフォルト値にフォールバック、または適切にマイグレーション（将来予定）を行います。
  - クラスストアは、初期化時に永続化データをロードし、状態の更新（セーブメソッドなど）と同期して `LocalStorageManager` を介してデータを保存する責務を持ちます。

### 5. Tailwind CSS v4 のマークアップ規約
Tailwind CSS v4 を前提とし、インラインユーティリティクラスを最大限に活用してスタイリングを行います。

- **ルール**:
  - 個別のコンポーネント固有の装飾は、原則としてインラインクラスを記述します（Svelte コンポーネントの `<style>` に `@apply` を多用することは極力避けます）。
  - カスタムカラーやブレークポイント、共通テーマ値はグローバル CSS ファイル（`src/routes/layout.css` など）で `@theme` ディレクティブを用いて定義し、セマンティックな名称（`bg-main`, `text-base`, `bg-danger/50` など）を利用します。
  - クラス名の動的な結合は、JavaScript/TypeScript のテンプレートリテラルや配列記法、ユーティリティクラスを用いてシンプルに記述します。
    - 例: `class={["p-2", active ? "bg-main" : "bg-disabled"]}`

### 6. 非同期処理 & Web Workers
アニメーション、正確なインターバルタイマー、その他の重い処理を行う場合、メインスレッドをブロックしないよう Web Worker を積極的に活用します。

- **ルール**:
  - 精確な時間制御が必要なタイマー処理などでは、`$lib/workers/` 配下にワーカースクリプトを設置し、コンポーネントやストアのライフサイクル（`onMount` / `onDestroy`）に合わせてワーカースレッドとのメッセージング処理を記述してください。

---

## AIエージェントへの開発指示・制約事項

AIエージェントが本プロジェクトで作業を行う場合、以下の制約を厳格に遵守してください。

1. **一貫性の徹底**: 
   - 新しい機能やページを作成する際は、既存の「Class Store パターン」や「Paraglide による i18n」、「Zod バリデーション」のスタイルを完全に再現してください。
2. **型とランタイム定数の適切な分離**:
   - `src/lib/types/` 配下の型ファイルには型宣言のみを配置し、多言語メッセージ関数などのランタイム値は配置しないでください。ランタイムの定数は `constants/` に配置するか、コンポーネント内で定義してください。
3. **不要なコード・ログの削除**:
   - `console.log()` などのデバッグ用コードは、マージ・コミット前に必ずすべて削除してください。
4. **命名規則**:
   - ストアファイル: `{domain}.store.ts` または `{domain}.svelte.ts`
   - ストアクラス名: `{Domain}Store`（例: `PomodoroStore`）
   - エクスポートインスタンス名: 小文字キャメルケース（例: `pomodoroStore`）
   - コンポーネントファイル: パスカルケース（例: `DisplayTime.svelte`）
5. **テストの考慮**:
   - ロジック（計算、遷移判定など）はなるべく純粋関数として別ファイル（`services/` など）に分離し、将来的に単体テストが容易に導入できる設計を維持してください。
