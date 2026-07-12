# moizlu-tools デザインシステム設計書 (DESIGN.md)

本ドキュメントは、本プロジェクト（SvelteKit + Svelte 5 + Tailwind CSS v4）におけるビジュアルアイデンティティ、UIコンポーネント、デザインシステムを構成する各種トークンおよびパターンの包括的な設計仕様を整理したものです。

---

## 1. デザイン哲学 (Design Philosophy)

本プロジェクトは、**シンプル、フラット、かつ高機能なシングルページアプリケーション（SPA）ツール集**を目指して設計されています。
- **ミニマリズム & 実用性**: 装飾を最小限に抑え、ツールとしての使いやすさ、明瞭さを最優先します。
- **流れるようなトランジション**: View Transition APIやマイクロインタラクションアニメーションを活用し、ページ遷移や状態変化が直感的に伝わるスムーズなUIを提供します。
- **ダークモード・多言語ファースト**: システムまたはユーザー設定にシームレスに適応するライト＆ダークテーマと、日本語・英語をシームレスに切り替える多言語設計をコアに据えています。

---

## 2. デザイン・トークン (Design Tokens)

すべてのスタイルとビジュアル一貫性は、Tailwind CSS v4 で定義されたカスタムCSS変数（デザイン・トークン）によって制御されています。

### 2.1 カラーシステム (Color System)
背景、テキスト、アクセント、およびフィードバックカラーは、ライトモードとダークモードでセマンティクスに基づいて動的に変化します。

| トークン名 | CSS変数 | ライトモード値 | ダークモード値 | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| **Base** (背景) | `--color-base` | `neutral-100` (`#f5f5f5`) | `neutral-800` (`#262626`) | アプリ全体の主要な背景色 |
| **Main** (主キー) | `--color-main` | `#E2421F` | `#E2421F` | プライマリアクセント、タイマーの進行、朱色の象徴色 |
| **Label** (文字色) | `--color-label` | `neutral-800` (`#262626`) | `neutral-100` (`#f5f5f5`) | 主要なテキスト、アイコンの主線色 |
| **Base Accent** | `--color-base-accent` | Base に Label を 5% 混合 | Base に Label を 5% 混合 | フォーム背景など、背景から少し浮き上がらせる領域用 |
| **Information** | `--color-information` | `sky-400` (`#38bdf8`) | (不変 / `sky-400`) | 情報表示、休憩中のタイマー色など |
| **Success** | `--color-success` | `green-700` (`#15803d`) | `green-500` (`#22c55e`) | 成功、完了、肯定的なフィードバック |
| **Danger** | `--color-danger` | `red-600` (`#dc2626`) | `red-500` (`#ef4444`) | エラー、リセット、危険アクション、否定的なフィードバック |
| **Warning** | `--color-warning` | `yellow-500` (`#eab308`) | `yellow-300` (`#fde047`) | 警告、注意喚起 |
| **Disabled** | `--color-disabled` | `neutral-300` (`#d4d4d4`) | `neutral-500` (`#737373`) | 無効化されたボタン、選択不可の要素 |

### 2.2 タイポグラフィ (Typography)
- **プライマリフォント**: `--font-primary: "Noto Sans JP", "monospace";`
  - 日本語と英語の混在時にも美しく、ツールの数値表現にも適した等幅/ゴシック系フォントを選択。
- **見出しスケール**:
  - `h1`: `text-lg` (SP) / `text-xl` (Tablet) / `text-2xl` (PC) + `font-bold`
  - `h2`: `text-lg` (SP) / `text-xl` (PC) + `font-bold`
  - `h3`: `text-sm` (SP) / `text-lg` (PC) + `font-bold`
- **主要テキストスタイル**:
  - タイマーなどの巨大文字: `text-6xl font-bold`
  - 注意書きなどの微小テキスト: `text-xs`

### 2.3 レイアウト & スペーシング (Layout & Spacing)
- **セーフエリア・スペーシング**: モバイルデバイスの Notch やホームインジケータに対応するためのカスタム変数。
  - `--spacing-safe-top`, `--spacing-safe-bottom`, `--spacing-safe-left`
  - `--spacing-safe-right` (※ `safe-area-inset-right` の割り当て。右側用)
  - `--spacing-safe-x`, `--spacing-safe-y`
- **ブレークポイント**:
  - `--breakpoint-xs: 500px;` (標準的な極小デバイス、スマホ用)
  - `--breakpoint-2xs: 365px;` (旧来のコンパクトなスマホ用)
- **コンテンツ幅制限**:
  - 各ツールのコンテンツエリアは、画面の中央にコンパクトに収めるため、最大幅を制限しています。
  - 基本最大幅: `max-w-200` (約 `800px` / Pomodoro等)、または中央配置用の `w-60` (トップページリンク等)

### 2.4 アニメーション & トランジション (Animations)
- **ページ遷移 (View Transition API)**: SvelteKit のナビゲーションに合わせて滑らかなフェードアウト/フェードインを実現。
  - `::view-transition-old(root)` / `::view-transition-new(root)` を用いたフェード (`0.1s ease-in-out`)。
- **タイマーコロンの点滅**: `DisplayTime` におけるコロン (`:`) の `opacity` アニメーション (`duration: 800ms`)。
- **ローディングドットアニメーション**: 4つの正方形ドットが左から右へ滑らかにスライドしながら不透明度が変化するバウンス型アニメーション。

---

## 3. UIコンポーネントライブラリ (Core Components)

### 3.1 アイコン・画像コンポーネント (Iconography)
- **`SvgIcon`**:
  - SVGコンポーネントをPropsとして受け取り、一元的なサイズ管理 (`size: number | { width, height }`) と Tailwind カラー割り当て (`fill-current`) を可能にする汎用コンポーネント。
- **`Icon`**:
  - ライト用画像 (`lightSrc`) とダーク用画像 (`darkSrc`) の2つの画像を受け取り、`dark:` プレフィックスをトリガーに滑らかな不透明度フェード (`transition-opacity duration-300`) で切り替えるイメージラッパー。

### 3.2 インタラクティブ要素 (Interactive Components)
- **共通ボタンスタイル (`.button-general`)**:
  - 角丸 `rounded-lg` と、ホバー/アクティブ時に変化するフラットかつリッチなドロップシャドウ (`shadow-black shadow-md/50` から `shadow-sm/25` へ遷移)。
- **バリアントボタン**:
  - **ベースボタン (`.button-base`)**: 背景が控えめな要素用 (`bg-base hover:bg-label/5 active:bg-label/40`)。
  - **プライマリボタン (`.button-label`)**: テキストと背景を反転させ目立たせるスタイル (`bg-label hover:bg-label/80 active:bg-label/60`)。
- **フォームコントロール**:
  - **テキスト/数値入力 (`.input-general`)**: 入力背景を `bg-base-accent` とし、ボトムに太い境界線 (`border-label border-b-2`) を配置。フォーカス時には `ring-1` で包みます。
  - **スライダー/レンジ (`.input-range-general`)**: スライダー全体の軌道を `bg-base-accent` で表現し、ツマミ (`thumb`) 部分をメインカラーの正方形 (`bg-main rounded-sm`) で表現するフラットデザイン。
  - **トグルスイッチ (`.toggle-switch`)**: チェックボックスを完全にフラットなトグルにカスタマイズ。オフ時は `bg-base-accent`、オン時はツマミがメインカラー (`bg-main`) に変化し、右へスライド。

### 3.3 フィードバック & ローディング (Feedback & Overlays)
- **`ModalWindowEntrypoint` (モーダルダイアログ)**:
  - 状態管理ストア `modalWindow` を介して一元管理される高機能ダイアログ。
  - 背景のぼかし (`backdrop-blur-sm`)、コントラスト調整、フルスクリーン / ウィンドウモードの切り替えに対応。
  - Svelte の `fade` および `fly` アニメーションを用いた美麗な登場エフェクト。
- **`SplashScreen`**:
  - アプリ読み込み時に表示されるオーバーレイ。2秒以上読み込みが遅延した場合、自動的に「低速読み込み警告」メッセージを浮き上がらせるユーザーフレンドリーな設計。
- **`LoadingAnimation`**:
  - 4つの正方形（メインカラー `bg-main`）が規則的にバウンス移動するミニマルなインジケータ。

### 3.4 データビジュアライゼーション (Data Visuals)
- **`CircularProgressBar`**:
  - SVGを使用したドーナツ型の円形進行インジケータ。
  - 内側の円を `stroke-label` (背景) とし、外側の進行バーにアニメーションする `stroke-main` (作業中) / `stroke-information` (休憩中) のバリアントを適用。
  - 中央部に子スニペット（`DisplayTime` など）を配置可能な柔軟設計。

---

## 4. 設計パターン & ガイドライン (Design Patterns)

### 4.1 Svelte 5 Runes とスタイル連携
- **コンポーネント Props (`$props`)**:
  - Propsはすべて明示的な TypeScript インターフェースで型定義し、オブジェクト分割代入で `$props` から取得します。
- **動的クラス名の配列・条件分岐結合**:
  - 状態に応じた動的なクラス結合は、文字列補間を避け、以下のように配列または三項演算子で記述し可読性を担保します。
  ```svelte
  class={["transition-all duration-300", active ? "bg-main" : "bg-disabled"]}
  ```

### 4.2 Tailwind CSS v4 のマークアップ規約
- **インラインユーティリティの推奨**:
  - 各コンポーネント固有の装飾には `@apply` を多用せず、コンポーネント内にインラインで記述します。
  - ただし、本システム全体で使い回す基本的なインプットやボタン、共通フレックス位置合わせなどは、グローバルな `layout.css` に集約ユーティリティとして定義されています（`.flex-center`, `.button-general`, `.input-general` など）。

### 4.3 テーマの切り替えシステム (Dark Mode)
- `.dark` クラスが `<html>` に付与された際、`@layer theme` を用いて、抽象化されたCSS変数の実態（`--color-base` 等）を切り替えます。
- CSSカラーミキシング (`color-mix(in srgb, ...)`) を組み合わせることで、テーマ状態に自動追従するセマンティックカラー（`--color-base-accent`）を実現しています。

### 4.4 国際化 (i18n) との調和
- 多言語化には Paraglide JS の `m` モジュールを全面的に採用。
- 言語切り替え時にレイアウトが崩れないよう、文字長の違いを考慮した `grid` や `flex` のレスポンシブ幅、およびテキストサイズ（`text-xs sm:text-lg` 等）の設定に配慮します。
