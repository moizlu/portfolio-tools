# リファクタリング方針案

> プロジェクト全体のコード品質・保守性向上を目的としたリファクタリング案

## プロジェクトの現状分析

### 技術スタック
- SvelteKit 5（Runes モード強制）+ Svelte 5
- Static Adapter（静的サイト、SPA的運用）
- Tailwind CSS v4
- TypeScript + ESLint
- Paraglide JS（i18n: ja/en）
- Zod（ランタイムバリデーション）
- 状態管理: `$state` Runes ベースの Class Store

### ディレクトリ構成の特徴
- **機能別**というより**レイヤー別**構成（stores/, types/, schema/, utils/, components/）
- `$lib` のフラットな配置、features（pomodoro, counter）は routes 側に散在
- `src/routes/pomodoro/` 以下に page, settings, DisplayTime コンポーネント

---

## フェーズ1: 基盤改善（低リスク・高インパクト）

### 1. 型とランタイム値の分離

**問題:** `src/lib/types/pomodoro.ts` で `SessionNames` が内部で `m.session_focus()` を呼び出しており、型定義ファイルが i18n メッセージに結合している。

**改善案:**
```
src/lib/types/pomodoro.ts        → Session, AppName などの型エイリアスのみ
src/lib/constants/pomodoro.ts    → SessionNames, SessionList などのランタイム定数
```

```typescript
// types/pomodoro.ts
export type Session = "working" | "short-breaking" | "long-breaking";

// constants/pomodoro.ts
import { m } from "$lib/paraglide/messages";
export const SessionNames: Record<Session, string> = {
    working: m.session_focus(),
    "short-breaking": m.session_short_break(),
    "long-breaking": m.session_long_break(),
};
```

**メリット:** 型の再利用性向上、循環参照のリスク低減、テスト容易性の向上

### 2. LocalStorageManager の改善

**問題:**
- `AppName` が `"counter" | "pomodoro"` の union でハードコード
- スキーママイグレーションがない（古いデータが残るとパース失敗で初期値に戻るだけ）
- `copiedData` → 編集 → `save()` のフローが冗長

**改善案:**
```typescript
export class LocalStorageManager<T extends z.ZodType> {
    constructor(
        private name: string,        // string に緩和
        private schema: T,
        private defaultValue: z.infer<T>,
        private version?: number,    // スキーマバージョン
    ) { /* ... */ }

    // getSnapshot(): 直接読み取り (リアクティブでない)
    // save(data): バリデーション + 保存
    // 将来的に version 差分で migration 処理
}
```

---

## フェーズ2: ポモドーロ Store の責務分離（中リスク・高インパクト）

### 問題点
現在の `Store` クラス（142行）は以下の責務が混在している:
1. **状態管理** (`$state` で保持するデータ)
2. **ビジネスロジック** (session 計算、経過時間計算、transition 判定)
3. **永続化** (`LocalStorageManager` 経由で保存)
4. **イベント発行** (`document.dispatchEvent`)
5. **タイマー更新** (`update()` で遅延補正含む)

### 改善案: 3層構造へ分解

```
src/lib/features/pomodoro/
├── types.ts              # 型定義のみ
├── constants.ts          # 定数 (SessionNames 等)
├── services/
│   ├── timer.service.ts        # 純粋関数: 時間計算、セッション判定(テスト容易)
│   └── persistence.service.ts  # localStorage 入出力
├── stores/
│   └── store.svelte.ts         # $state 管理のみ (薄く保つ)
└── components/           # (フェーズ3で)
```

#### 2a. TimerService (純粋関数)

```typescript
// services/timer.service.ts
export function calcSession(stateTransCount: number, longBreakInterval: number): Session {
    // 状態遷移なし、副作用なし、テスト容易
}

export function calcElapsedMs(
    lastUpdatedMs: number | undefined,
    now: number,
): { elapsedSec: number; delayMs: number } {
    // 時間差分計算（遅延補正込み）
}

export function calcDisplayTime(
    currentSessionSec: number,
    elapsedSec: number,
): { min: string; sec: string; minInt: number; secInt: number } {
    // 表示用フォーマット
}
```

#### 2b. Store (薄く)

```typescript
// stores/store.svelte.ts
export class PomodoroStore {
    // 純粋に state の管理だけ
    data = $state(...);
    session = $state<Session>("working");
    paused = $state(true);

    // ビジネスロジックは service に委譲
    update(): boolean {
        const { elapsedSec, delayMs } = calcElapsedMs(...);
        this._data.elapsedSec += elapsedSec;
        // ...
    }
}
```

**メリット:**
- ビジネスロジックにテストが書ける（`pnpm vitest`）
- Store の責務が明確になり、変更影響範囲が限定される
- タイマー誤差補正ロジックの検証が容易に

---

## フェーズ3: コンポーネント分割（中リスク）

### 3a. Pomodoro Page (+page.svelte) の分割

現在 238 行の問題点:
| 責務 | 該当行 |
|------|--------|
| 音声管理 | 2 import + onMount 内で `new Audio()` |
| Web Worker 管理 | onMount 内で worker 生成・制御 |
| Service Worker 管理 | onMount 内で register |
| キーボード/可視性イベント | 複数の `document.addEventListener` |
| モーダルスニペット定義 | resetDialog, helpDialog (Snippet) |
| UI レイアウト | メインのマークアップ |

**改善案:** 責務ごとに分割

```
src/routes/pomodoro/
├── +page.svelte              # 全体を composition（薄く）
├── components/
│   ├── PomodoroTimer.svelte       # タイマー表示 + プログレスバー
│   ├── PomodoroControls.svelte    # Play/Pause/Reset/Skip ボタン群
│   ├── PomodoroSessionInfo.svelte # セッション名、回数表示
│   └── dialogs/
│       ├── ResetDialog.svelte
│       └── HelpDialog.svelte
```

**Svelte 5 のコンポジション活用法:**
```svelte
<!-- +page.svelte -->
<script lang="ts">
    import { PomodoroTimer, PomodoroControls, PomodoroSessionInfo } from './components';
    import { useKeyboardShortcut } from '$lib/actions/keyboard';
    import { useSoundManager } from '$lib/composables/useSoundManager';

    const { playBreakSound, playFocusSound } = useSoundManager();
    useKeyboardShortcut('Space', () => store.paused = !store.paused);
</script>
```

### 3b. カスタムアクションの抽出

```typescript
// src/lib/actions/keyboard.ts
export function useKeyboardShortcut(key: string, handler: () => void) {
    $effect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === key) handler();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    });
}

// src/lib/actions/visibility.ts
export function useVisibilityChange(visible: () => void, hidden: () => void) {
    $effect(() => {
        const handler = () => document.hidden ? hidden() : visible();
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    });
}
```

---

## フェーズ4: 横断的改善（継続的）

### 4a. CSS のモジュール化

現在 `layout.css` が全 component 用のユーティリティクラスを保持。

**方向性:**
- `layout.css` はテーマ定義と `@theme` のみに縮小
- `.button-general`, `.input-general` 等は各コンポーネントの `<style>` に `@apply` で記述
- または `src/lib/styles/` にドメイン別に分割

**メリット:** 変更影響範囲の明確化、CSS の肥大化防止

### 4b. テスト基盤の導入

```bash
pnpm add -D vitest @sveltejs/vite-plugin-svelte
```

**優先的にテストを書くべき箇所:**
| 対象 | 理由 |
|------|------|
| `calcSession()` | 状態遷移ロジックに条件分岐が多い |
| `calcElapsedMs()` | 遅延補正の境界値検証 |
| `LocalStorageManager` | スキーマバリデーション・マイグレーション |
| `DisplayTime` のフォーマット | 値の範囲・ゼロ埋め |

### 4c. Store 命名規則の統一

現状のファイル名の揺れ:
| ファイル | クラス名 | エクスポート名 |
|----------|----------|----------------|
| `pomodoro.svelte.ts` | `Store` | `store` |
| `store.svelte.ts` | `SplashStore` | `splashStore` |
| `theme.svelte.ts` | `ThemeManager` | `theme` |
| `modal-window.store.svelte.ts` | `ModalWindowManager` | `modalWindow` |

**統一案:**
- ファイル名: `{domain}.store.ts` or `{domain}.svelte.ts`
- クラス名: `{Domain}Store`
- シングルトンエクスポート: 小文字キャメルケース（現在と同じでOK）

---

## 優先順位サマリー

| 優先度 | フェーズ | 項目 | 見積もり規模 | リスク |
|--------|----------|------|-------------|--------|
| 🔴 P0 | Phase 1 | 型と定数の分離 | 数時間 | 低 |
| 🔴 P0 | Phase 1 | LocalStorageManager 改善 | 数時間 | 低 |
| 🟡 P1 | Phase 2 | TimerService 抽出 | 半日〜1日 | 中 |
| 🟡 P1 | Phase 2 | Store 責務分割 | 半日 | 中 |
| 🟢 P2 | Phase 3 | ページコンポーネント分割 | 半日〜1日 | 中 |
| 🟢 P2 | Phase 3 | カスタムアクション・コンポーザブル | 数時間 | 低 |
| 🔵 P3 | Phase 4 | テスト基盤 + テスト作成 | 1日〜 | 低 |
| 🔵 P3 | Phase 4 | CSS 整理 | 随時 | 低 |

---

## 技術的負債のポイント（即効性のあるもの）

1. **`calcDateAfterMs` 内の `console.log(new Date())`** → 削除
2. **`PomodoroType` のネームスペースインポート** → 使っていない場所での import 整理
3. **`static/service-worker.js` が空ファイル** → 不要なら削除
4. **`SessionNames` の `session_pomodoro` と `session_focus` が重複** → どちらかに統一
5. **ESLint の `no-undef: 'off'`** → TSプロジェクトで問題ないが、不要なルールオーバーライドは削除

---

## 結論

最も効果的なのは **Phase 1 の型・定数の整理 + LocalStorageManager 改善**で、これらは他のリファクタリングの基盤となる。次に **Phase 2 のビジネスロジック分離**でテスタビリティを獲得する。コンポーネント分割（Phase 3）は UI の見通しをよくするが、テストがない状態で行うとリグレッションリスクがあるため、テスト基盤（Phase 4）と並行して進めるのが望ましい。
